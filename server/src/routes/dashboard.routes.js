const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboard.controller');
const { authUser } = require('../auth/checkAuth');

router.get('/stats', authUser, DashboardController.getStats);
router.get('/chart', authUser, DashboardController.getChartData);
router.get('/recent', authUser, DashboardController.getRecentActivity);
router.get('/advanced', authUser, DashboardController.getAdvancedStats);

module.exports = router;
