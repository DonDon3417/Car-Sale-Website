const chatService = require('../services/chat.service');
const { OK, Created } = require('../core/success.response');

class ChatController {
    // Tạo hoặc lấy cuộc hội thoại
    getOrCreateConversation = async (req, res, next) => {
        const customerId = req.user.id; // Fixed: use 'id' instead of '_id'
        const { type, relatedCarId, title } = req.body;

        new Created({
            message: 'Conversation retrieved/created successfully',
            metadata: await chatService.getOrCreateConversation(customerId, type, relatedCarId, title),
        }).send(res);
    };

    // Lấy danh sách cuộc hội thoại của customer
    getMyConversations = async (req, res, next) => {
        const customerId = req.user.id;

        new OK({
            message: 'Conversations retrieved successfully',
            metadata: await chatService.getCustomerConversations(customerId),
        }).send(res);
    };

    // Lấy danh sách cuộc hội thoại cho admin
    getAdminConversations = async (req, res, next) => {
        const { status } = req.query;
        const adminId = req.query.myOnly === 'true' ? req.user.id : null;

        new OK({
            message: 'Admin conversations retrieved successfully',
            metadata: await chatService.getAdminConversations(adminId, status),
        }).send(res);
    };

    // Lấy chi tiết cuộc hội thoại
    getConversationById = async (req, res, next) => {
        const { id } = req.params;
        const userId = req.user.id;

        new OK({
            message: 'Conversation retrieved successfully',
            metadata: await chatService.getConversationById(id, userId),
        }).send(res);
    };

    // Gửi tin nhắn
    sendMessage = async (req, res, next) => {
        const { id } = req.params;
        const senderId = req.user.id;
        const { content, messageType, loanInfo } = req.body;

        new Created({
            message: 'Message sent successfully',
            metadata: await chatService.sendMessage(id, senderId, content, messageType, loanInfo),
        }).send(res);
    };

    // Admin nhận cuộc hội thoại
    assignAdmin = async (req, res, next) => {
        const { id } = req.params;
        const adminId = req.user.id;

        new OK({
            message: 'Conversation assigned successfully',
            metadata: await chatService.assignAdmin(id, adminId),
        }).send(res);
    };

    // Đóng cuộc hội thoại
    closeConversation = async (req, res, next) => {
        const { id } = req.params;
        const userId = req.user.id;

        new OK({
            message: 'Conversation closed successfully',
            metadata: await chatService.closeConversation(id, userId),
        }).send(res);
    };

    // Đánh dấu đã giải quyết
    resolveConversation = async (req, res, next) => {
        const { id } = req.params;

        new OK({
            message: 'Conversation resolved successfully',
            metadata: await chatService.resolveConversation(id),
        }).send(res);
    };

    // Lấy số cuộc hội thoại chưa đọc
    getUnreadCount = async (req, res, next) => {
        new OK({
            message: 'Unread count retrieved successfully',
            metadata: { unreadCount: await chatService.getUnreadCountForAdmin() },
        }).send(res);
    };
}

module.exports = new ChatController();
