const Deposit = require('../models/deposit.model');
const Car = require('../models/cars.model');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../core/error.response');

const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

const crypto = require('crypto');
const https = require('https');

function generatePayID() {
    // Tạo ID thanh toán bao gồm cả giây để tránh trùng lặp
    const now = new Date();
    const timestamp = now.getTime();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `PAY${timestamp}${seconds}${milliseconds}`;
}

class DepositService {
    // Tạo đặt cọc mới
    async createDeposit(userId, data) {
        const { carId, carVersion, carColor, carPrice, paymentMethod, note, customerPhone } = data;

        // Validate car exists
        const car = await Car.findById(carId);
        if (!car) {
            throw new NotFoundError('Xe không tồn tại');
        }

        // Check if car is available
        if (car.status !== 'available' || car.stock < 1) {
            throw new BadRequestError('Xe này hiện không còn sẵn để đặt cọc');
        }

        // Check if user already has pending deposit for this car
        const existingDeposit = await Deposit.findOne({
            user: userId,
            car: carId,
            status: { $in: ['confirmed'] },
        });

        // if (existingDeposit) {
        //     throw new BadRequestError('Bạn đã có đơn đặt cọc cho xe này');
        // }

        // Calculate deposit amount (10% of car price)
        const depositAmount = Math.round(carPrice * 0.1);

        const deposit = await Deposit.create({
            user: userId,
            car: carId,
            carVersion: carVersion || '',
            carColor: carColor || '',
            carPrice,
            depositAmount,
            paymentMethod,
            note: note || '',
            customerPhone: customerPhone || '',
        });

        if (paymentMethod === 'VNPAY') {
            const vnpay = new VNPay({
                tmnCode: process.env.VNPAY_TMN_CODE,
                secureSecret: process.env.VNPAY_SECURE_SECRET,
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayResponse = await vnpay.buildPaymentUrl({
                vnp_Amount: deposit.depositAmount, //
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${deposit._id} + ${generatePayID()}`, // Sử dụng paymentId thay vì singlePaymentId
                vnp_OrderInfo: `Thanh toan don hang ${deposit._id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/deposit/vnpay-callback`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            });

            return vnpayResponse;
        } else if (paymentMethod === 'MOMO') {
            return new Promise(async (resolve, reject) => {
                const accessKey = process.env.MOMO_ACCESS_KEY;
                const secretKey = process.env.MOMO_SECRET_KEY;
                const partnerCode = process.env.MOMO_PARTNER_CODE;
                const orderId = partnerCode + new Date().getTime();
                const requestId = orderId;
                const orderInfo = `Thanh toan don hang ${deposit._id}`;
                const redirectUrl = `http://localhost:3000/api/deposit/momo-callback`;
                const ipnUrl = `http://localhost:3000/api/deposit/momo-callback`;
                const requestType = 'payWithMethod';
                const amount = deposit.depositAmount;
                const extraData = '';

                const rawSignature =
                    'accessKey=' +
                    accessKey +
                    '&amount=' +
                    amount +
                    '&extraData=' +
                    extraData +
                    '&ipnUrl=' +
                    ipnUrl +
                    '&orderId=' +
                    orderId +
                    '&orderInfo=' +
                    orderInfo +
                    '&partnerCode=' +
                    partnerCode +
                    '&redirectUrl=' +
                    redirectUrl +
                    '&requestId=' +
                    requestId +
                    '&requestType=' +
                    requestType;

                const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

                const requestBody = JSON.stringify({
                    partnerCode,
                    partnerName: 'Test',
                    storeId: 'MomoTestStore',
                    requestId,
                    amount,
                    orderId,
                    orderInfo,
                    redirectUrl,
                    ipnUrl,
                    lang: 'vi',
                    requestType,
                    autoCapture: true,
                    extraData,
                    orderGroupId: '',
                    signature,
                });

                const options = {
                    hostname: 'test-payment.momo.vn',
                    port: 443,
                    path: '/v2/gateway/api/create',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestBody),
                    },
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (err) {
                            reject(err);
                        }
                    });
                });

                req.on('error', (e) => reject(e));
                req.write(requestBody);
                req.end();
            });
        }

        // return deposit;
    }

    // Lấy danh sách đặt cọc của user
    async getMyDeposits(userId) {
        const deposits = await Deposit.find({ user: userId, paymentStatus: 'completed' })
            .populate('car', 'name slug images brand category price')
            .populate({
                path: 'car',
                populate: [
                    { path: 'brand', select: 'name' },
                    { path: 'category', select: 'name' },
                ],
            })
            .sort({ createdAt: -1 });

        return deposits;
    }

    // Lấy thông tin đặt cọc theo ID
    async getDepositById(depositId, userId, isAdmin = false) {
        const deposit = await Deposit.findById(depositId)
            .populate('car', 'name slug images brand category price versions colors')
            .populate('user', 'fullName email phone')
            .populate({
                path: 'car',
                populate: [
                    { path: 'brand', select: 'name' },
                    { path: 'category', select: 'name' },
                ],
            });

        if (!deposit) {
            throw new NotFoundError('Không tìm thấy đơn đặt cọc');
        }

        // Check if user owns this deposit or is admin
        const depositUserId = deposit.user?._id || deposit.user;
        if (depositUserId?.toString() !== userId.toString() && !isAdmin) {
            throw new ForbiddenError('Bạn không có quyền xem đơn đặt cọc này');
        }

        return deposit;
    }

    // Hủy đặt cọc
    async cancelDeposit(depositId, userId, reason = '', isAdmin = false) {
        const deposit = await Deposit.findById(depositId);

        if (!deposit) {
            throw new NotFoundError('Không tìm thấy đơn đặt cọc');
        }

        // Check ownership
        if (deposit.user.toString() !== userId.toString() && !isAdmin) {
            throw new ForbiddenError('Bạn không có quyền hủy đơn đặt cọc này');
        }

        // Can only cancel pending deposits
        if (deposit.status !== 'pending') {
            throw new BadRequestError('Không thể hủy đơn đặt cọc này');
        }

        deposit.status = 'cancelled';
        deposit.cancelledAt = new Date();
        deposit.cancelReason = reason || '';
        await deposit.save();

        return deposit;
    }

    // Admin: Lấy tất cả đặt cọc (bỏ qua đơn chưa thanh toán)
    async getAllDeposits(filters = {}) {
        const { status, paymentMethod, page = 1, limit = 10 } = filters;

        const filter = { paymentStatus: { $ne: 'pending' } };
        if (status) filter.status = status;
        if (paymentMethod) filter.paymentMethod = paymentMethod;

        const skip = (page - 1) * limit;

        const [deposits, total] = await Promise.all([
            Deposit.find(filter)
                .populate('user', 'fullName email phone')
                .populate('car', 'name slug images brand')
                .populate({
                    path: 'car',
                    populate: { path: 'brand', select: 'name' },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Deposit.countDocuments(filter),
        ]);

        return {
            deposits,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Admin: Cập nhật trạng thái đặt cọc
    async updateDepositStatus(depositId, data) {
        const { status, paymentStatus, transactionId } = data;

        const deposit = await Deposit.findById(depositId);

        if (!deposit) {
            throw new NotFoundError('Không tìm thấy đơn đặt cọc');
        }

        // Update fields if provided
        if (status) {
            deposit.status = status;
            if (status === 'confirmed') {
                deposit.confirmedAt = new Date();
            } else if (status === 'cancelled') {
                deposit.cancelledAt = new Date();
            }
        }

        if (paymentStatus) {
            deposit.paymentStatus = paymentStatus;
        }

        if (transactionId) {
            deposit.transactionId = transactionId;
        }

        await deposit.save();

        return deposit;
    }

    // Thống kê đặt cọc
    async getDepositStats() {
        const [totalDeposits, pendingDeposits, confirmedDeposits, completedDeposits, cancelledDeposits, totalRevenue] =
            await Promise.all([
                Deposit.countDocuments(),
                Deposit.countDocuments({ status: 'pending' }),
                Deposit.countDocuments({ status: 'confirmed' }),
                Deposit.countDocuments({ status: 'completed' }),
                Deposit.countDocuments({ status: 'cancelled' }),
                Deposit.aggregate([
                    { $match: { paymentStatus: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$depositAmount' } } },
                ]),
            ]);

        return {
            totalDeposits,
            pendingDeposits,
            confirmedDeposits,
            completedDeposits,
            cancelledDeposits,
            totalRevenue: totalRevenue[0]?.total || 0,
        };
    }

    async vnpayCallBack(id) {
        const deposit = await Deposit.findById(id);
        if (!deposit) {
            throw new NotFoundError('Không tìm thấy đơn đặt cọc');
        }
        deposit.status = 'confirmed';
        deposit.paymentStatus = 'completed';
        await deposit.save();
        return deposit;
    }

    async momoCallBack(id) {
        const deposit = await Deposit.findById(id);
        if (!deposit) {
            throw new NotFoundError('Không tìm thấy đơn đặt cọc');
        }
        deposit.status = 'confirmed';
        deposit.paymentStatus = 'completed';
        await deposit.save();
        return deposit;
    }
}

module.exports = new DepositService();
