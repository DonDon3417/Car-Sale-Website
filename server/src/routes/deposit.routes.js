const express = require('express');
const router = express.Router();
const depositController = require('../controller/deposit.controller');
const { authUser, authAdmin, asyncHandler } = require('../auth/checkAuth');

// User routes
router.post('/create', authUser, asyncHandler(depositController.createDeposit));
router.get('/my-deposits', authUser, asyncHandler(depositController.getMyDeposits));
router.get('/detail/:id', authUser, asyncHandler(depositController.getDepositById));
router.put('/:id/cancel', authUser, asyncHandler(depositController.cancelDeposit));
router.get('/vnpay-callback', asyncHandler(depositController.vnpayCallBack));
router.get('/momo-callback', asyncHandler(depositController.momoCallback));

// Admin routes
router.get('/admin/all', authAdmin, asyncHandler(depositController.getAllDeposits));
router.get('/admin/export-csv', authAdmin, asyncHandler(depositController.exportDepositsCsv));
router.put('/admin/:id/status', authAdmin, asyncHandler(depositController.updateDepositStatus));
router.get('/admin/stats', authAdmin, asyncHandler(depositController.getDepositStats));

module.exports = router;
