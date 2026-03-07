const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho một tin nhắn
const messageSchema = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'loan_info'],
            default: 'text',
        },
        // Thông tin xe và trả góp (nếu loại tin nhắn là loan_info)
        loanInfo: {
            carId: { type: Schema.Types.ObjectId, ref: 'Car' },
            carName: String,
            carPrice: Number,
            downPaymentPercent: Number,
            loanTerm: Number,
            interestRate: Number,
            monthlyPayment: Number,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

// Schema cho cuộc hội thoại
const conversationSchema = new Schema(
    {
        // Khách hàng trong cuộc hội thoại
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        // Admin phụ trách (có thể null ban đầu)
        admin: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            default: null,
        },
        // Loại cuộc hội thoại
        type: {
            type: String,
            enum: ['general', 'loan_consultation', 'test_drive', 'support'],
            default: 'general',
        },
        // Thông tin xe liên quan (nếu có)
        relatedCar: {
            type: Schema.Types.ObjectId,
            ref: 'Car',
            default: null,
        },
        // Tiêu đề cuộc hội thoại
        title: {
            type: String,
            default: 'Tư vấn mua xe',
        },
        // Trạng thái cuộc hội thoại
        status: {
            type: String,
            enum: ['pending', 'active', 'resolved', 'closed'],
            default: 'pending',
        },
        // Danh sách tin nhắn
        messages: [messageSchema],
        // Tin nhắn cuối cùng (để hiển thị preview)
        lastMessage: {
            content: String,
            sender: { type: Schema.Types.ObjectId, ref: 'user' },
            createdAt: Date,
        },
        // Số tin nhắn chưa đọc của admin
        unreadCountAdmin: {
            type: Number,
            default: 0,
        },
        // Số tin nhắn chưa đọc của customer
        unreadCountCustomer: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

// Index để tìm kiếm nhanh
conversationSchema.index({ customer: 1 });
conversationSchema.index({ admin: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
