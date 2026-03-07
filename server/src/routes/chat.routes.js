const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const chatController = require('../controller/chat.controller');

// Customer routes
router.post('/conversation', authUser, asyncHandler(chatController.getOrCreateConversation));
router.get('/my-conversations', authUser, asyncHandler(chatController.getMyConversations));
router.get('/conversation/:id', authUser, asyncHandler(chatController.getConversationById));
router.post('/conversation/:id/message', authUser, asyncHandler(chatController.sendMessage));
router.patch('/conversation/:id/close', authUser, asyncHandler(chatController.closeConversation));

// Admin routes
router.get('/admin/conversations', authAdmin, asyncHandler(chatController.getAdminConversations));
router.patch('/admin/conversation/:id/assign', authAdmin, asyncHandler(chatController.assignAdmin));
router.patch('/admin/conversation/:id/resolve', authAdmin, asyncHandler(chatController.resolveConversation));
router.get('/admin/unread-count', authAdmin, asyncHandler(chatController.getUnreadCount));

module.exports = router;
