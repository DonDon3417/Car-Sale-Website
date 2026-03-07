const DashboardService = require('../services/dashboard.service');
const { OK } = require('../core/success.response');

class DashboardController {
    async getStats(req, res, next) {
        try {
            const stats = await DashboardService.getStats();
            new OK({
                message: 'Get stats successfully',
                metadata: stats,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    async getChartData(req, res, next) {
        try {
            const data = await DashboardService.getChartData();
            new OK({
                message: 'Get chart data successfully',
                metadata: data,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    async getRecentActivity(req, res, next) {
        try {
            const activity = await DashboardService.getRecentActivity();
            new OK({
                message: 'Get recent activity successfully',
                metadata: activity,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    async getAdvancedStats(req, res, next) {
        try {
            const stats = await DashboardService.getAdvancedStats();
            new OK({
                message: 'Get advanced stats successfully',
                metadata: stats,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DashboardController();
