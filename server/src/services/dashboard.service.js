const User = require('../models/users.model');
const Car = require('../models/cars.model');
const Deposit = require('../models/deposit.model');
const Blog = require('../models/blog.model');
const moment = require('moment');

class DashboardService {
    // Get aggregated stats
    async getStats() {
        const startOfMonth = moment().startOf('month');
        const startOfLastMonth = moment().subtract(1, 'months').startOf('month');
        const endOfLastMonth = moment().subtract(1, 'months').endOf('month');

        // Parallel fetch for current values
        const [totalUsers, totalCars, totalDeposits, totalRevenueDoc] = await Promise.all([
            User.countDocuments(),
            Car.countDocuments(),
            Deposit.countDocuments(),
            Deposit.aggregate([
                { $match: { status: { $in: ['confirmed', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$depositAmount' } } },
            ]),
        ]);

        // Calculate growth
        const [usersLastMonth, depositsLastMonth, revenueLastMonthDoc] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() } }),
            Deposit.countDocuments({ createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() } }),
            Deposit.aggregate([
                {
                    $match: {
                        status: { $in: ['confirmed', 'completed'] },
                        createdAt: { $gte: startOfLastMonth.toDate(), $lte: endOfLastMonth.toDate() },
                    },
                },
                { $group: { _id: null, total: { $sum: '$depositAmount' } } },
            ]),
        ]);

        const usersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth.toDate() } });
        const depositsThisMonth = await Deposit.countDocuments({ createdAt: { $gte: startOfMonth.toDate() } });
        const revenueThisMonthDoc = await Deposit.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'completed'] },
                    createdAt: { $gte: startOfMonth.toDate() },
                },
            },
            { $group: { _id: null, total: { $sum: '$depositAmount' } } },
        ]);

        const totalRevenue = totalRevenueDoc[0]?.total || 0;
        const revenueLastMonth = revenueLastMonthDoc[0]?.total || 0;
        const revenueThisMonth = revenueThisMonthDoc[0]?.total || 0;

        return {
            totalUsers,
            totalCars,
            totalDeposits,
            totalRevenue,
            usersGrowth: this.calculateGrowth(usersThisMonth, usersLastMonth),
            depositsGrowth: this.calculateGrowth(depositsThisMonth, depositsLastMonth),
            revenueGrowth: this.calculateGrowth(revenueThisMonth, revenueLastMonth),
        };
    }

    calculateGrowth(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    }

    // Get chart data (Revenue & Orders last 6 months)
    async getChartData() {
        const sixMonthsAgo = moment().subtract(5, 'months').startOf('month').toDate();

        const revenueData = await Deposit.aggregate([
            {
                $match: {
                    status: { $in: ['confirmed', 'completed'] },
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    revenue: { $sum: '$depositAmount' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Format for frontend
        const months = [];
        for (let i = 0; i < 6; i++) {
            const d = moment().subtract(5 - i, 'months');
            const found = revenueData.find((r) => r._id.month === d.month() + 1 && r._id.year === d.year());
            months.push({
                name: `Tháng ${d.month() + 1}`,
                revenue: found ? found.revenue : 0,
                orders: found ? found.orders : 0,
            });
        }
        // Reverse to show oldest to newest
        return months.reverse();
    }

    // Get recent activity
    async getRecentActivity() {
        const [deposits, users] = await Promise.all([
            Deposit.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'fullName avatar email')
                .populate('car', 'name images price'),
            User.find().sort({ createdAt: -1 }).limit(5).select('fullName avatar email createdAt role'),
        ]);

        return { deposits, users };
    }

    // NEW: Get advanced statistics
    async getAdvancedStats() {
        const [carsByBrand, carsByCategory, depositsByStatus] = await Promise.all([
            Car.aggregate([
                {
                    $lookup: {
                        from: 'brands',
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brandInfo',
                    },
                },
                {
                    $unwind: '$brandInfo',
                },
                {
                    $group: {
                        _id: '$brandInfo.name',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            Car.aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'cateInfo',
                    },
                },
                {
                    $unwind: '$cateInfo',
                },
                {
                    $group: {
                        _id: '$cateInfo.name',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            Deposit.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        value: { $sum: '$depositAmount' },
                    },
                },
            ]),
        ]);

        return {
            carsByBrand,
            carsByCategory,
            depositsByStatus,
        };
    }
}

module.exports = new DashboardService();
