const ChatbotService = require('../services/chatbot.service');
const { OK, Created } = require('../core/success.response');

class ChatbotController {
    // Tạo session mới
    createSession = async (req, res, next) => {
        new Created({
            message: 'Chat session created successfully',
            metadata: await ChatbotService.createSession(req.user.id),
        }).send(res);
    };

    // Lấy danh sách sessions
    getSessions = async (req, res, next) => {
        new OK({
            message: 'Sessions retrieved successfully',
            metadata: await ChatbotService.getSessions(req.user.id),
        }).send(res);
    };

    // Lấy session chi tiết
    getSessionById = async (req, res, next) => {
        new OK({
            message: 'Session retrieved successfully',
            metadata: await ChatbotService.getSessionById(req.params.id),
        }).send(res);
    };

    // Gửi tin nhắn
    sendMessage = async (req, res, next) => {
        const { content } = req.body;
        new OK({
            message: 'Message sent successfully',
            metadata: await ChatbotService.sendMessage(req.params.id, content),
        }).send(res);
    };

    // Xoá session
    deleteSession = async (req, res, next) => {
        new OK({
            message: 'Session deleted successfully',
            metadata: await ChatbotService.deleteSession(req.params.id),
        }).send(res);
    };

    // Thống kê (Admin)
    getStats = async (req, res, next) => {
        new OK({
            message: 'Stats retrieved successfully',
            metadata: await ChatbotService.getStats(),
        }).send(res);
    };
}

module.exports = new ChatbotController();
