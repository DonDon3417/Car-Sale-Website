const TestDrive = require('../models/testDrive.model');
const Car = require('../models/cars.model');
const TestDriveSlot = require('../models/testDriveSlot.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { sendTestDriveConfirmation, sendTestDriveRejection } = require('../utils/emailTestDriver');

// Các khung giờ có thể đặt (8h-17h, nghỉ trưa 12h)
const TIME_SLOTS = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
];
const MIN_CANCEL_HOURS_BEFORE = Number(process.env.TEST_DRIVE_CANCEL_MIN_HOURS || 2);

class TestDriveService {
    parseBookingDate(date) {
        if (!date) return null;

        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
            const [year, month, day] = date.split('-').map(Number);
            const parsed = new Date(year, month - 1, day);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    }

    getDayRange(date) {
        const startOfDay = this.parseBookingDate(date);
        if (!startOfDay) {
            throw new BadRequestError('Ngày đặt lịch không hợp lệ');
        }

        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        return { startOfDay, endOfDay };
    }

    getBookingDateTime(date, timeSlot) {
        const bookingTime = this.parseBookingDate(date);
        if (!bookingTime) {
            throw new BadRequestError('Ngày đặt lịch không hợp lệ');
        }

        const [hour, minute] = timeSlot.split(':').map(Number);
        bookingTime.setHours(hour, minute, 0, 0);
        return bookingTime;
    }

    isPastTimeSlotForToday(date, timeSlot) {
        const now = new Date();
        const inputDate = this.parseBookingDate(date);

        if (!inputDate) {
            return false;
        }

        if (inputDate.toDateString() !== now.toDateString()) {
            return false;
        }

        const bookingTime = this.getBookingDateTime(inputDate, timeSlot);
        return bookingTime <= now;
    }

    validateBookingPayload({ carId, date, timeSlot, fullName, phone, email }) {
        if (!carId || !date || !timeSlot || !fullName || !phone) {
            throw new BadRequestError('Thiếu thông tin đặt lịch lái thử');
        }

        const trimmedName = String(fullName).trim();
        if (trimmedName.length < 2) {
            throw new BadRequestError('Họ tên không hợp lệ');
        }

        const normalizedPhone = String(phone).trim();
        if (!/^\+?[0-9]{9,12}$/.test(normalizedPhone)) {
            throw new BadRequestError('Số điện thoại không hợp lệ');
        }

        if (email) {
            const normalizedEmail = String(email).trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                throw new BadRequestError('Email không hợp lệ');
            }
        }
    }

    // Kiểm tra ngày hợp lệ (không phải thứ 7, CN)
    isValidDate(date) {
        const d = this.parseBookingDate(date);
        if (!d || Number.isNaN(d.getTime())) return false;
        const dayOfWeek = d.getDay();
        // 0 = Chủ nhật, 6 = Thứ 7
        return dayOfWeek !== 0 && dayOfWeek !== 6;
    }

    // Kiểm tra ngày trong tương lai
    isFutureDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = this.parseBookingDate(date);
        if (!inputDate) return false;
        return inputDate >= today;
    }

    // Lấy danh sách khung giờ còn trống cho 1 ngày
    async getAvailableSlots(date, carId) {
        if (!this.isValidDate(date)) {
            throw new BadRequestError('Không thể đặt lịch vào thứ 7 hoặc Chủ nhật');
        }

        if (!this.isFutureDate(date)) {
            throw new BadRequestError('Không thể đặt lịch cho ngày trong quá khứ');
        }

        const { startOfDay, endOfDay } = this.getDayRange(date);
        const car = carId ? await Car.findById(carId).select('status').lean() : null;

        if (carId && !car) {
            throw new NotFoundError('Không tìm thấy xe');
        }

        if (carId && car.status !== 'available') {
            return TIME_SLOTS.map((slot) => ({ time: slot, available: false }));
        }

        const carReservedSlotSet = new Set();

        if (carId) {
            const carReservedSlots = await TestDriveSlot.find(
                {
                    car: car._id,
                    date: { $gte: startOfDay, $lte: endOfDay },
                },
                { timeSlot: 1, _id: 0 },
            ).lean();

            carReservedSlots.forEach((item) => carReservedSlotSet.add(item.timeSlot));
        }

        return TIME_SLOTS.map((slot) => ({
            time: slot,
            available: !this.isPastTimeSlotForToday(date, slot) && (!carId || !carReservedSlotSet.has(slot)),
        }));
    }

    // Tạo lịch đặt lái thử mới
    async createBooking(data) {
        const { customerId, carId, date, timeSlot, fullName, phone, email, note } = data;

        this.validateBookingPayload({ carId, date, timeSlot, fullName, phone, email });

        // Validate ngày
        if (!this.isValidDate(date)) {
            throw new BadRequestError('Không thể đặt lịch vào thứ 7 hoặc Chủ nhật');
        }

        if (!this.isFutureDate(date)) {
            throw new BadRequestError('Không thể đặt lịch cho ngày trong quá khứ');
        }

        if (this.isPastTimeSlotForToday(date, timeSlot)) {
            throw new BadRequestError('Không thể đặt giờ trong quá khứ');
        }

        // Validate khung giờ
        if (!TIME_SLOTS.includes(timeSlot)) {
            throw new BadRequestError('Khung giờ không hợp lệ');
        }

        // Kiểm tra xe tồn tại
        const car = await Car.findById(carId);
        if (!car) {
            throw new NotFoundError('Không tìm thấy xe');
        }

        if (car.status !== 'available') {
            throw new BadRequestError('Xe không khả dụng để lái thử ở thời điểm hiện tại');
        }

        const { startOfDay, endOfDay } = this.getDayRange(date);
        const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
        const normalizedFullName = String(fullName).trim();
        const normalizedPhone = String(phone).trim();

        let reservedSlot;
        try {
            reservedSlot = await TestDriveSlot.create({
                car: carId,
                date: startOfDay,
                timeSlot,
            });
        } catch (error) {
            if (error?.code === 11000) {
                throw new BadRequestError('Xe đã có lịch trong khung giờ này, vui lòng chọn giờ khác');
            }

            throw error;
        }

        if (!reservedSlot) {
            throw new BadRequestError('Xe đã có lịch trong khung giờ này, vui lòng chọn giờ khác');
        }

        let booking;
        try {
            const carBookings = await TestDrive.countDocuments({
                car: carId,
                date: { $gte: startOfDay, $lte: endOfDay },
                timeSlot,
                status: { $nin: ['cancelled'] },
            });

            if (carBookings >= 1) {
                throw new BadRequestError('Xe đã hết lượt lái thử trong khung giờ này');
            }

            booking = await TestDrive.create({
                customer: customerId,
                car: carId,
                date: startOfDay,
                timeSlot,
                fullName: normalizedFullName,
                phone: normalizedPhone,
                email: normalizedEmail,
                note,
                status: 'pending',
            });
        } catch (error) {
            await TestDriveSlot.findOneAndDelete({
                car: carId,
                date: startOfDay,
                timeSlot,
            });
            throw error;
        }

        return await TestDrive.findById(booking._id)
            .populate('customer', 'fullName email phone')
            .populate('car', 'name price images slug');
    }

    // Lấy danh sách booking của customer
    async getCustomerBookings(customerId) {
        return await TestDrive.find({ customer: customerId })
            .populate('car', 'name price images slug')
            .populate('processedBy', 'fullName')
            .sort({ date: -1 });
    }

    // Lấy danh sách booking cho admin
    async getAdminBookings(filters = {}) {
        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        return await TestDrive.find(query)
            .populate('customer', 'fullName email phone')
            .populate('car', 'name price images slug brand')
            .populate('processedBy', 'fullName')
            .sort({ createdAt: -1 });
    }

    // Lấy chi tiết booking
    async getBookingById(bookingId) {
        const booking = await TestDrive.findById(bookingId)
            .populate('customer', 'fullName email phone')
            .populate('car', 'name price images slug brand')
            .populate('processedBy', 'fullName');

        if (!booking) {
            throw new NotFoundError('Không tìm thấy lịch hẹn');
        }

        return booking;
    }

    // Admin xác nhận booking
    async confirmBooking(bookingId, adminId, adminNote = '') {
        const booking = await TestDrive.findById(bookingId);

        if (!booking) {
            throw new NotFoundError('Không tìm thấy lịch hẹn');
        }

        if (booking.status !== 'pending') {
            throw new BadRequestError('Chỉ có thể xác nhận lịch hẹn đang chờ');
        }

        booking.status = 'confirmed';
        booking.processedBy = adminId;
        booking.adminNote = adminNote;
        await booking.save();

        // Gửi email xác nhận
        if (booking.email) {
            try {
                // Populate car để lấy tên xe
                await booking.populate('car');
                await sendTestDriveConfirmation(
                    booking.email,
                    booking.fullName,
                    booking.car.name,
                    booking.date,
                    booking.timeSlot,
                );
            } catch (error) {
                console.error('Lỗi gửi email xác nhận:', error);
            }
        }

        return await this.getBookingById(bookingId);
    }

    // Admin đánh dấu hoàn thành
    async completeBooking(bookingId, adminId) {
        const booking = await TestDrive.findById(bookingId);

        if (!booking) {
            throw new NotFoundError('Không tìm thấy lịch hẹn');
        }

        if (booking.status !== 'confirmed') {
            throw new BadRequestError('Chỉ có thể hoàn thành lịch hẹn đã xác nhận');
        }

        booking.status = 'completed';
        booking.processedBy = adminId;
        await booking.save();

        return await this.getBookingById(bookingId);
    }

    // Hủy booking
    async cancelBooking(bookingId, userId, reason = '', isAdmin = false) {
        const booking = await TestDrive.findById(bookingId);

        if (!booking) {
            throw new NotFoundError('Không tìm thấy lịch hẹn');
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            throw new BadRequestError('Không thể hủy lịch hẹn này');
        }

        if (!isAdmin && booking.status === 'confirmed') {
            const bookingDateTime = this.getBookingDateTime(booking.date, booking.timeSlot);
            const diffMs = bookingDateTime.getTime() - Date.now();
            if (diffMs < MIN_CANCEL_HOURS_BEFORE * 60 * 60 * 1000) {
                throw new BadRequestError(`Chỉ có thể hủy trước giờ hẹn ít nhất ${MIN_CANCEL_HOURS_BEFORE} tiếng`);
            }
        }

        booking.status = 'cancelled';
        booking.cancelReason = reason;
        booking.processedBy = userId;
        await booking.save();

        const { startOfDay } = this.getDayRange(booking.date);
        await TestDriveSlot.findOneAndDelete({
            car: booking.car,
            date: startOfDay,
            timeSlot: booking.timeSlot,
        });

        // Gửi email từ chối/hủy
        // Chỉ gửi nếu người thực hiện hủy là admin (dựa vào flag isAdmin truyền từ controller)
        if (booking.email && isAdmin) {
            try {
                await booking.populate('car');
                await sendTestDriveRejection(
                    booking.email,
                    booking.fullName,
                    booking.car.name,
                    booking.date,
                    booking.timeSlot,
                    reason || 'Không có lý do cụ thể',
                );
            } catch (error) {
                console.error('Lỗi gửi email từ chối:', error);
            }
        }

        return await this.getBookingById(bookingId);
    }

    // Lấy thống kê cho admin
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await TestDrive.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
                    confirmed: [{ $match: { status: 'confirmed' } }, { $count: 'count' }],
                    completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
                    cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }],
                    todayBookings: [
                        {
                            $match: {
                                date: { $gte: today },
                                status: { $in: ['pending', 'confirmed'] },
                            },
                        },
                        { $count: 'count' },
                    ],
                },
            },
        ]);

        return {
            total: stats[0].total[0]?.count || 0,
            pending: stats[0].pending[0]?.count || 0,
            confirmed: stats[0].confirmed[0]?.count || 0,
            completed: stats[0].completed[0]?.count || 0,
            cancelled: stats[0].cancelled[0]?.count || 0,
            conversionRate:
                (stats[0].total[0]?.count || 0) > 0
                    ? Number((((stats[0].completed[0]?.count || 0) / (stats[0].total[0]?.count || 0)) * 100).toFixed(2))
                    : 0,
            todayBookings: stats[0].todayBookings[0]?.count || 0,
        };
    }
}

module.exports = new TestDriveService();
