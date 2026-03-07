const mongoose = require('mongoose');

const testDriveSchema = new mongoose.Schema(
    {
        // Thông tin khách hàng
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        // Xe muốn lái thử
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            required: true,
        },
        // Ngày đặt lịch
        date: {
            type: Date,
            required: true,
        },
        // Khung giờ (8-17h)
        timeSlot: {
            type: String,
            required: true,
            enum: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
        },
        // Thông tin liên hệ
        fullName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        // Ghi chú thêm
        note: {
            type: String,
        },
        // Trạng thái
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            default: 'pending',
        },
        // Lý do hủy (nếu có)
        cancelReason: {
            type: String,
        },
        // Admin xử lý
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        // Ghi chú của admin
        adminNote: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

// Index để tìm kiếm nhanh theo ngày và khung giờ
testDriveSchema.index({ date: 1, timeSlot: 1 });
testDriveSchema.index({ customer: 1 });
testDriveSchema.index({ status: 1 });

// Static method kiểm tra khung giờ còn trống
testDriveSchema.statics.isSlotAvailable = async function (date, timeSlot) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        status: { $nin: ['cancelled'] },
    });

    // Mỗi khung giờ chỉ cho tối đa 2 lịch hẹn
    return existingBookings < 2;
};

// Static method lấy các khung giờ đã full trong ngày
testDriveSchema.statics.getFullSlots = async function (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.aggregate([
        {
            $match: {
                date: { $gte: startOfDay, $lte: endOfDay },
                status: { $nin: ['cancelled'] },
            },
        },
        {
            $group: {
                _id: '$timeSlot',
                count: { $sum: 1 },
            },
        },
        {
            $match: {
                count: { $gte: 2 },
            },
        },
    ]);

    return bookings.map((b) => b._id);
};

module.exports = mongoose.model('TestDrive', testDriveSchema);
