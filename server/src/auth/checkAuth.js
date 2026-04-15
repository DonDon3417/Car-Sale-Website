const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { verifyToken } = require('../utils/jwt');
const modelUser = require('../models/users.model');

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }

    return req.cookies.token;
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const authUser = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) throw new AuthFailureError('Vui lòng đăng nhập');
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');
        const decoded = await verifyToken(token);
        const { id } = decoded;
        const findUser = await modelUser.findOne({ _id: id });
        if (!findUser || findUser.isAdmin === false) {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
};
