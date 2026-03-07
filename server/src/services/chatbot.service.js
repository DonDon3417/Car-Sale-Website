const ChatSession = require('../models/chatSession.model');
const { chatWithBot } = require('../utils/chatbot');

class ChatbotService {
    /**
     * Tạo session mới
     */
    static async createSession(userId) {
        const session = await ChatSession.create({
            userId,
            messages: [],
            interestScore: 0,
            level: 'Cold',
            reason: '',
        });
        return session;
    }

    /**
     * Lấy danh sách sessions của user
     */
    static async getSessions(userId) {
        const sessions = await ChatSession.find({ userId })
            .sort({ updatedAt: -1 })
            .select('messages interestScore level createdAt updatedAt')
            .lean();

        return sessions.map((s) => ({
            _id: s._id,
            lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content : 'Cuộc hội thoại mới',
            messageCount: s.messages.length,
            interestScore: s.interestScore,
            level: s.level,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));
    }

    /**
     * Lấy session chi tiết
     */
    static async getSessionById(sessionId) {
        const session = await ChatSession.findById(sessionId).lean();
        if (!session) throw new Error('Không tìm thấy phiên chat');
        return session;
    }

    /**
     * Gửi tin nhắn và nhận phản hồi AI
     */
    static async sendMessage(sessionId, content) {
        const session = await ChatSession.findById(sessionId);
        if (!session) throw new Error('Không tìm thấy phiên chat');

        // Thêm tin nhắn user
        session.messages.push({
            role: 'user',
            content,
            timestamp: new Date(),
        });

        // Gọi AI
        const result = await chatWithBot(session.messages);

        // Thêm tin nhắn AI
        session.messages.push({
            role: 'assistant',
            content: result.reply,
            timestamp: new Date(),
        });

        // Cập nhật interest score
        session.interestScore = result.interestScore;
        session.level = result.level;
        session.reason = result.reason;

        await session.save();

        return {
            reply: result.reply,
            interestScore: result.interestScore,
            level: result.level,
            reason: result.reason,
        };
    }

    /**
     * Xoá session
     */
    static async deleteSession(sessionId) {
        const result = await ChatSession.findByIdAndDelete(sessionId);
        if (!result) throw new Error('Không tìm thấy phiên chat');
        return { deleted: true };
    }

    /**
     * Thống kê chatbot cho admin dashboard
     */
    static async getStats() {
        const [totalSessions, levelCounts, avgScore, dailyChats, scoreTrend] = await Promise.all([
            // Tổng số sessions
            ChatSession.countDocuments(),

            // Đếm theo level
            ChatSession.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]),

            // Trung bình interestScore
            ChatSession.aggregate([{ $group: { _id: null, avg: { $avg: '$interestScore' } } }]),

            // Số cuộc chat theo ngày (14 ngày gần nhất)
            ChatSession.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // Xu hướng interestScore theo ngày (14 ngày)
            ChatSession.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                        },
                        avgScore: { $avg: '$interestScore' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        // Chuyển đổi level counts
        const levels = { Hot: 0, Warm: 0, Cold: 0 };
        levelCounts.forEach((lc) => {
            if (levels.hasOwnProperty(lc._id)) {
                levels[lc._id] = lc.count;
            }
        });

        return {
            totalSessions,
            avgInterestScore: Math.round((avgScore[0]?.avg || 0) * 10) / 10,
            levels,
            dailyChats: dailyChats.map((d) => ({
                date: d._id,
                count: d.count,
            })),
            scoreTrend: scoreTrend.map((d) => ({
                date: d._id,
                avgScore: Math.round((d.avgScore || 0) * 10) / 10,
            })),
        };
    }
}

module.exports = ChatbotService;
