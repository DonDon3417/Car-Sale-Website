const { OK, Created } = require('../core/success.response');
const depositService = require('../services/deposit.service');

class DepositController {
    // Create new deposit
    async createDeposit(req, res, next) {
        try {
            const userId = req.user.id;
            const deposit = await depositService.createDeposit(userId, req.body);

            new Created({
                message: 'Tạo đơn đặt cọc thành công',
                metadata: deposit,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Get user's deposits
    async getMyDeposits(req, res, next) {
        try {
            const userId = req.user.id;
            const deposits = await depositService.getMyDeposits(userId);

            new OK({
                message: 'Lấy danh sách đặt cọc thành công',
                metadata: deposits,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Get deposit by ID
    async getDepositById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const isAdmin = req.user.isAdmin || false;

            const deposit = await depositService.getDepositById(id, userId, isAdmin);

            new OK({
                message: 'Lấy thông tin đặt cọc thành công',
                metadata: deposit,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Cancel deposit
    async cancelDeposit(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { reason } = req.body;
            const isAdmin = req.user.isAdmin || false;

            const deposit = await depositService.cancelDeposit(id, userId, reason, isAdmin);

            new OK({
                message: 'Hủy đơn đặt cọc thành công',
                metadata: deposit,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Admin: Get all deposits
    async getAllDeposits(req, res, next) {
        try {
            const result = await depositService.getAllDeposits(req.query);

            new OK({
                message: 'Lấy danh sách đặt cọc thành công',
                metadata: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Admin: Update deposit status
    async updateDepositStatus(req, res, next) {
        try {
            const { id } = req.params;
            const deposit = await depositService.updateDepositStatus(id, req.body);

            new OK({
                message: 'Cập nhật đơn đặt cọc thành công',
                metadata: deposit,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Get deposit statistics
    async getDepositStats(req, res, next) {
        try {
            const stats = await depositService.getDepositStats();

            new OK({
                message: 'Thống kê đặt cọc',
                metadata: stats,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    async vnpayCallBack(req, res, next) {
        const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
        const id = vnp_OrderInfo.split(' ')[4];
        const data = await depositService.vnpayCallBack(id);
        res.redirect(`${process.env.URL_CLIENT}/payment/success/${data._id}`);
    }

    async momoCallback(req, res) {
        const { orderInfo } = req.query;
        const id = orderInfo.split(' ')[4];
        const payment = await depositService.momoCallBack(id);
        res.redirect(`${process.env.URL_CLIENT}/payment/success/${payment._id}`);
    }
}

module.exports = new DepositController();
