const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { asyncHandler } = require('../auth/checkAuth');
const carController = require('../controller/car.controller');

// Tạo thư mục uploads/cars nếu chưa có
const uploadDir = path.join(__dirname, '../uploads/cars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter,
});

// Middleware to prevent caching for car data
const noCacheMiddleware = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
};

// Routes - Order matters! Specific routes before generic ones
router.post('/create', upload.array('images', 10), asyncHandler(carController.createCar));
router.get('/slug/:slug', noCacheMiddleware, asyncHandler(carController.getCarBySlug));
router.get('/', noCacheMiddleware, asyncHandler(carController.getAllCars));
router.get('/:id', noCacheMiddleware, asyncHandler(carController.getCarById));
router.put('/:id', upload.array('images', 10), asyncHandler(carController.updateCar));
router.delete('/:id', asyncHandler(carController.deleteCar));
router.post('/:id/delete-image', asyncHandler(carController.deleteImage));

// So sánh xe
router.post('/compare', asyncHandler(carController.compareCars));
router.post('/ai-analyze', asyncHandler(carController.aiAnalyzeComparison));

module.exports = router;
