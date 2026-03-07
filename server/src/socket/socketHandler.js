const { Server } = require('socket.io');
const cookie = require('cookie');
const { verifyToken } = require('../utils/jwt');
const chatService = require('../services/chat.service');
const modelUser = require('../models/users.model');

class SocketHandler {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.URL_CLIENT,
                credentials: true,
            },
        });

        // Lưu trữ socket connections
        this.userSockets = new Map(); // userId -> socketId
        this.adminSockets = new Map(); // adminId -> socketId

        this.initialize();
    }

    initialize() {
        // Middleware xác thực
        this.io.use(async (socket, next) => {
            try {
                const cookies = cookie.parse(socket.handshake.headers.cookie || '');
                const token = cookies.token;

                if (!token) {
                    return next(new Error('Authentication required'));
                }

                const decoded = await verifyToken(token);

                // Lấy thông tin user từ database để check isAdmin
                const user = await modelUser.findById(decoded.id).lean();
                if (user) {
                    socket.user = {
                        id: user._id.toString(),
                        fullName: user.fullName,
                        isAdmin: user.isAdmin || false,
                    };
                } else {
                    socket.user = decoded;
                }

                next();
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.user.id}, isAdmin: ${socket.user.isAdmin}`);

            // Lưu socket connection
            this.userSockets.set(socket.user.id, socket.id);

            // Nếu là admin, lưu vào adminSockets
            if (socket.user.isAdmin) {
                this.adminSockets.set(socket.user.id, socket.id);
                console.log(`Admin registered: ${socket.user.id}`);
            }

            // Join room cho conversation
            socket.on('join_conversation', (conversationId) => {
                socket.join(`conversation_${conversationId}`);
                console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
            });

            // Leave room
            socket.on('leave_conversation', (conversationId) => {
                socket.leave(`conversation_${conversationId}`);
                console.log(`User ${socket.user.id} left conversation ${conversationId}`);
            });

            // Gửi tin nhắn
            socket.on('send_message', async (data) => {
                try {
                    const { conversationId, content, messageType, loanInfo } = data;

                    // Lưu tin nhắn vào database
                    const result = await chatService.sendMessage(
                        conversationId,
                        socket.user.id,
                        content,
                        messageType,
                        loanInfo,
                    );

                    // Emit tin nhắn mới đến room
                    this.io.to(`conversation_${conversationId}`).emit('new_message', {
                        message: result.message,
                        conversation: result.conversation,
                    });

                    // Notify admin nếu customer gửi tin nhắn
                    if (!socket.user.isAdmin) {
                        console.log('Notifying admins of new customer message...');
                        this.notifyAdmins('new_customer_message', {
                            conversationId,
                            message: result.message,
                            customerName: result.conversation.customer.fullName,
                        });
                    }

                    // Notify customer nếu admin gửi tin nhắn
                    if (socket.user.isAdmin) {
                        const customerSocketId = this.userSockets.get(result.conversation.customer._id.toString());
                        if (customerSocketId) {
                            this.io.to(customerSocketId).emit('new_admin_message', {
                                conversationId,
                                message: result.message,
                            });
                        }
                    }
                } catch (error) {
                    console.error('Send message error:', error);
                    socket.emit('error', { message: error.message });
                }
            });

            // Typing indicator
            socket.on('typing_start', (conversationId) => {
                socket.to(`conversation_${conversationId}`).emit('user_typing', {
                    userId: socket.user.id,
                    userName: socket.user.fullName,
                });
            });

            socket.on('typing_stop', (conversationId) => {
                socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
                    userId: socket.user.id,
                });
            });

            // Admin nhận cuộc hội thoại
            socket.on('admin_assign', async (conversationId) => {
                try {
                    const conversation = await chatService.assignAdmin(conversationId, socket.user.id);

                    // Notify customer
                    const customerSocketId = this.userSockets.get(conversation.customer._id.toString());
                    if (customerSocketId) {
                        this.io.to(customerSocketId).emit('admin_assigned', {
                            conversationId,
                            admin: conversation.admin,
                        });
                    }

                    // Notify all admins
                    this.notifyAdmins('conversation_assigned', {
                        conversationId,
                        adminId: socket.user.id,
                    });
                } catch (error) {
                    socket.emit('error', { message: error.message });
                }
            });

            // Đánh dấu đã đọc
            socket.on('mark_read', async (conversationId) => {
                try {
                    await chatService.getConversationById(conversationId, socket.user.id);
                    socket.to(`conversation_${conversationId}`).emit('messages_read', {
                        userId: socket.user.id,
                    });
                } catch (error) {
                    console.error('Mark read error:', error);
                }
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.user.id}`);
                this.userSockets.delete(socket.user.id);
                this.adminSockets.delete(socket.user.id);
            });
        });
    }

    // Notify tất cả admin online
    notifyAdmins(event, data) {
        console.log(`Notifying ${this.adminSockets.size} admins with event: ${event}`);
        this.adminSockets.forEach((socketId, adminId) => {
            console.log(`Sending to admin ${adminId} at socket ${socketId}`);
            this.io.to(socketId).emit(event, data);
        });
    }

    // Emit đến user cụ thể
    emitToUser(userId, event, data) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }
}

module.exports = SocketHandler;
