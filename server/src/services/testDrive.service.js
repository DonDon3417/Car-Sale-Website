const TestDrive = require('../models/testDrive.model');
const Car = require('../models/cars.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { sendTestDriveConfirmation, sendTestDriveRejection } = require('../utils/emailTestDriver');

// Các khung giờ có thể đặt (8h-17h, nghỉ trưa 12h)
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

class TestDriveService {
    // Kiểm tra ngày hợp lệ (không phải thứ 7, CN)
    isValidDate(date) {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        // 0 = Chủ nhật, 6 = Thứ 7
        return dayOfWeek !== 0 && dayOfWeek !== 6;
    }

    // Kiểm tra ngày trong tương lai
    isFutureDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(date);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
    }

    // Lấy danh sách khung giờ còn trống cho 1 ngày
    async getAvailableSlots(date) {
        if (!this.isValidDate(date)) {
            throw new BadRequestError('Không thể đặt lịch vào thứ 7 hoặc Chủ nhật');
        }

        if (!this.isFutureDate(date)) {
            throw new BadRequestError('Không thể đặt lịch cho ngày trong quá khứ');
        }

        const fullSlots = await TestDrive.getFullSlots(date);

        return TIME_SLOTS.map((slot) => ({
            time: slot,
            available: !fullSlots.includes(slot),
        }));
    }

    // Tạo lịch đặt lái thử mới
    async createBooking(data) {
        const { customerId, carId, date, timeSlot, fullName, phone, email, note } = data;

        // Validate ngày
        if (!this.isValidDate(date)) {
            throw new BadRequestError('Không thể đặt lịch vào thứ 7 hoặc Chủ nhật');
        }

        if (!this.isFutureDate(date)) {
            throw new BadRequestError('Không thể đặt lịch cho ngày trong quá khứ');
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

        // Kiểm tra slot còn trống
        const isAvailable = await TestDrive.isSlotAvailable(date, timeSlot);
        if (!isAvailable) {
            throw new BadRequestError('Khung giờ này đã được đặt, vui lòng chọn khung giờ khác');
        }

        // Tạo booking mới
        const booking = await TestDrive.create({
            customer: customerId,
            car: carId,
            date: new Date(date),
            timeSlot,
            fullName,
            phone,
            email,
            note,
            status: 'pending',
        });

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

        booking.status = 'cancelled';
        booking.cancelReason = reason;
        booking.processedBy = userId;
        await booking.save();

        // Gửi email từ chối/hủy
        // Chỉ gửi nếu người thực hiện hủy là admin (dựa vào flag isAdmin truyền từ controller)
        console.log('Cancel Check:', {
            hasEmail: !!booking.email,
            email: booking.email,
            userId,
            customer: booking.customer,
            isAdminFlag: isAdmin,
            reason,
        });

        if (booking.email && isAdmin) {
            try {
                await booking.populate('car');
                console.log('Sending rejection email to:', booking.email);
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
            todayBookings: stats[0].todayBookings[0]?.count || 0,
        };
    }
}

module.exports = new TestDriveService();
