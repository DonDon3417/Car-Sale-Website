const express = require('express');
const router = express.Router();

const testDriveController = require('../controller/testDrive.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

// ============ PUBLIC & CUSTOMER ============

// Lấy khung giờ còn trống (ai cũng xem được)
router.get('/available-slots', asyncHandler(testDriveController.getAvailableSlots));

// Đặt lịch lái thử (cần đăng nhập)
router.post('/booking', authUser, asyncHandler(testDriveController.createBooking));

// Lấy lịch đặt của tôi
router.get('/my-bookings', authUser, asyncHandler(testDriveController.getMyBookings));

// Hủy lịch đặt của tôi
router.patch('/my-bookings/:id/cancel', authUser, asyncHandler(testDriveController.cancelMyBooking));

// ============ ADMIN ============

// Lấy danh sách tất cả booking
router.get('/admin/bookings', authAdmin, asyncHandler(testDriveController.getAdminBookings));

// Lấy thống kê
router.get('/admin/stats', authAdmin, asyncHandler(testDriveController.getStats));

// Lấy chi tiết booking
router.get('/admin/bookings/:id', authAdmin, asyncHandler(testDriveController.getBookingById));

// Xác nhận booking
router.patch('/admin/bookings/:id/confirm', authAdmin, asyncHandler(testDriveController.confirmBooking));

// Đánh dấu hoàn thành
router.patch('/admin/bookings/:id/complete', authAdmin, asyncHandler(testDriveController.completeBooking));

// Hủy booking
router.patch('/admin/bookings/:id/cancel', authAdmin, asyncHandler(testDriveController.cancelBooking));

module.exports = router;
