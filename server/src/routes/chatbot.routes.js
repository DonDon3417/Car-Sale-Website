const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const chatbotController = require('../controller/chatbot.controller');

// User routes
router.post('/session', authUser, asyncHandler(chatbotController.createSession));
router.get('/sessions', authUser, asyncHandler(chatbotController.getSessions));
router.get('/session/:id', authUser, asyncHandler(chatbotController.getSessionById));
router.post('/session/:id/message', authUser, asyncHandler(chatbotController.sendMessage));
router.delete('/session/:id', authUser, asyncHandler(chatbotController.deleteSession));

// Admin routes
router.get('/stats', authAdmin, asyncHandler(chatbotController.getStats));
router.get('/admin/sessions', authAdmin, asyncHandler(chatbotController.getAdminSessions));
router.get('/admin/session/:id', authAdmin, asyncHandler(chatbotController.getAdminSessionById));

module.exports = router;
