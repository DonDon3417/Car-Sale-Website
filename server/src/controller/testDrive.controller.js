const testDriveService = require('../services/testDrive.service');
const { OK, Created } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class TestDriveController {
    // Lấy khung giờ còn trống
    getAvailableSlots = async (req, res) => {
        const { date, carId } = req.query;

        if (!date) {
            throw new BadRequestError('Vui lòng chọn ngày');
        }

        new OK({
            message: 'Available slots retrieved successfully',
            metadata: await testDriveService.getAvailableSlots(date, carId),
        }).send(res);
    };

    // Tạo booking mới
    createBooking = async (req, res) => {
        const customerId = req.user.id;
        const { carId, date, timeSlot, fullName, phone, email, note } = req.body;

        new Created({
            message: 'Đặt lịch lái thử thành công',
            metadata: await testDriveService.createBooking({
                customerId,
                carId,
                date,
                timeSlot,
                fullName,
                phone,
                email,
                note,
            }),
        }).send(res);
    };

    // Lấy booking của customer
    getMyBookings = async (req, res) => {
        const customerId = req.user.id;

        new OK({
            message: 'Bookings retrieved successfully',
            metadata: await testDriveService.getCustomerBookings(customerId),
        }).send(res);
    };

    // Hủy booking (customer)
    cancelMyBooking = async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;

        new OK({
            message: 'Đã hủy lịch hẹn',
            metadata: await testDriveService.cancelBooking(id, userId, reason, false),
        }).send(res);
    };

    // ============ ADMIN ============

    // Lấy danh sách booking (admin)
    getAdminBookings = async (req, res) => {
        const { status, date } = req.query;

        new OK({
            message: 'Admin bookings retrieved successfully',
            metadata: await testDriveService.getAdminBookings({ status, date }),
        }).send(res);
    };

    // Lấy chi tiết booking
    getBookingById = async (req, res) => {
        const { id } = req.params;

        new OK({
            message: 'Booking retrieved successfully',
            metadata: await testDriveService.getBookingById(id),
        }).send(res);
    };

    // Xác nhận booking
    confirmBooking = async (req, res) => {
        const { id } = req.params;
        const adminId = req.user.id;
        const { adminNote } = req.body;

        new OK({
            message: 'Đã xác nhận lịch hẹn',
            metadata: await testDriveService.confirmBooking(id, adminId, adminNote),
        }).send(res);
    };

    // Đánh dấu hoàn thành
    completeBooking = async (req, res) => {
        const { id } = req.params;
        const adminId = req.user.id;

        new OK({
            message: 'Đã đánh dấu hoàn thành',
            metadata: await testDriveService.completeBooking(id, adminId),
        }).send(res);
    };

    // Hủy booking (admin)
    cancelBooking = async (req, res) => {
        const { id } = req.params;
        const adminId = req.user.id;
        const { reason } = req.body;

        new OK({
            message: 'Đã hủy lịch hẹn',
            metadata: await testDriveService.cancelBooking(id, adminId, reason, true),
        }).send(res);
    };

    // Lấy thống kê
    getStats = async (req, res) => {
        new OK({
            message: 'Stats retrieved successfully',
            metadata: await testDriveService.getStats(),
        }).send(res);
    };
}

module.exports = new TestDriveController();
