const Conversation = require('../models/conversation.model');

class ChatService {
    // Tạo cuộc hội thoại mới hoặc lấy cuộc hội thoại hiện có
    async getOrCreateConversation(customerId, type = 'general', relatedCarId = null, title = 'Tư vấn mua xe') {
        try {
            // Tìm cuộc hội thoại đang active của customer với cùng loại và xe
            let conversation = await Conversation.findOne({
                customer: customerId,
                type,
                relatedCar: relatedCarId,
                status: { $in: ['pending', 'active'] },
            })
                .populate('customer', 'fullName email avatar')
                .populate('admin', 'fullName email avatar')
                .populate('relatedCar', 'name price images');

            // Nếu chưa có, tạo mới
            if (!conversation) {
                conversation = new Conversation({
                    customer: customerId,
                    type,
                    relatedCar: relatedCarId,
                    title,
                    status: 'pending',
                    messages: [],
                });
                await conversation.save();

                // Populate sau khi tạo
                conversation = await Conversation.findById(conversation._id)
                    .populate('customer', 'fullName email avatar')
                    .populate('admin', 'fullName email avatar')
                    .populate('relatedCar', 'name price images');
            }

            return conversation;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách cuộc hội thoại của customer
    async getCustomerConversations(customerId) {
        try {
            const conversations = await Conversation.find({ customer: customerId })
                .populate('customer', 'fullName email avatar')
                .populate('admin', 'fullName email avatar')
                .populate('relatedCar', 'name price images')
                .sort({ updatedAt: -1 });

            return conversations;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách cuộc hội thoại cho admin
    async getAdminConversations(adminId = null, status = null) {
        try {
            const filter = {};
            if (adminId) filter.admin = adminId;
            if (status) filter.status = status;

            const conversations = await Conversation.find(filter)
                .populate('customer', 'fullName email avatar phone')
                .populate('admin', 'fullName email avatar')
                .populate('relatedCar', 'name price images')
                .sort({ updatedAt: -1 });

            return conversations;
        } catch (error) {
            throw error;
        }
    }

    // Lấy cuộc hội thoại theo ID
    async getConversationById(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId)
                .populate('customer', 'fullName email avatar phone')
                .populate('admin', 'fullName email avatar')
                .populate('relatedCar', 'name price images slug');

            if (!conversation) {
                throw new Error('Không tìm thấy cuộc hội thoại');
            }

            // Kiểm tra quyền truy cập
            const isCustomer = conversation.customer._id.toString() === userId;
            const isAdmin = conversation.admin?._id?.toString() === userId;

            // Reset unread count cho người đọc
            if (isCustomer) {
                conversation.unreadCountCustomer = 0;
                // Mark messages as read
                conversation.messages.forEach((msg) => {
                    if (msg.sender.toString() !== userId) {
                        msg.isRead = true;
                    }
                });
            } else if (isAdmin) {
                conversation.unreadCountAdmin = 0;
                conversation.messages.forEach((msg) => {
                    if (msg.sender.toString() !== userId) {
                        msg.isRead = true;
                    }
                });
            }

            await conversation.save();

            return conversation;
        } catch (error) {
            throw error;
        }
    }

    // Gửi tin nhắn
    async sendMessage(conversationId, senderId, content, messageType = 'text', loanInfo = null) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Không tìm thấy cuộc hội thoại');
            }

            // Tạo tin nhắn mới
            const newMessage = {
                sender: senderId,
                content,
                messageType,
                loanInfo,
                isRead: false,
            };

            conversation.messages.push(newMessage);

            // Cập nhật lastMessage
            conversation.lastMessage = {
                content: messageType === 'loan_info' ? '📊 Thông tin trả góp' : content,
                sender: senderId,
                createdAt: new Date(),
            };

            // Cập nhật unread count
            const isCustomerSending = conversation.customer.toString() === senderId;
            if (isCustomerSending) {
                conversation.unreadCountAdmin += 1;
            } else {
                conversation.unreadCountCustomer += 1;
            }

            // Đổi status sang active nếu admin phản hồi
            if (!isCustomerSending && conversation.status === 'pending') {
                conversation.status = 'active';
                conversation.admin = senderId;
            }

            await conversation.save();

            // Populate và trả về tin nhắn mới nhất
            const updatedConversation = await Conversation.findById(conversationId)
                .populate('customer', 'fullName email avatar')
                .populate('admin', 'fullName email avatar')
                .populate('relatedCar', 'name price images');

            const lastMsg = updatedConversation.messages[updatedConversation.messages.length - 1];

            return {
                message: lastMsg,
                conversation: updatedConversation,
            };
        } catch (error) {
            throw error;
        }
    }

    // Admin nhận cuộc hội thoại
    async assignAdmin(conversationId, adminId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Không tìm thấy cuộc hội thoại');
            }

            conversation.admin = adminId;
            conversation.status = 'active';
            await conversation.save();

            return await Conversation.findById(conversationId)
                .populate('customer', 'fullName email avatar phone')
                .populate('admin', 'fullName email avatar')
                .populate('relatedCar', 'name price images');
        } catch (error) {
            throw error;
        }
    }

    // Đóng cuộc hội thoại
    async closeConversation(conversationId, userId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Không tìm thấy cuộc hội thoại');
            }

            conversation.status = 'closed';
            await conversation.save();

            return conversation;
        } catch (error) {
            throw error;
        }
    }

    // Đánh dấu đã giải quyết
    async resolveConversation(conversationId) {
        try {
            const conversation = await Conversation.findById(conversationId);

            if (!conversation) {
                throw new Error('Không tìm thấy cuộc hội thoại');
            }

            conversation.status = 'resolved';
            await conversation.save();

            return conversation;
        } catch (error) {
            throw error;
        }
    }

    // Lấy số cuộc hội thoại chưa đọc cho admin
    async getUnreadCountForAdmin() {
        try {
            const count = await Conversation.countDocuments({
                status: { $in: ['pending', 'active'] },
                unreadCountAdmin: { $gt: 0 },
            });

            return count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ChatService();
