const carService = require('../services/car.service');
const { Created, OK } = require('../core/success.response');

class CarController {
    // Tạo xe mới
    createCar = async (req, res, next) => {
        new Created({
            message: 'Create car success',
            metadata: await carService.createCar(req.body, req.files),
        }).send(res);
    };

    // Lấy tất cả xe
    getAllCars = async (req, res, next) => {
        new OK({
            message: 'Get all cars success',
            metadata: await carService.getAllCars(req.query),
        }).send(res);
    };

    // Lấy xe theo ID
    getCarById = async (req, res, next) => {
        new OK({
            message: 'Get car success',
            metadata: await carService.getCarById(req.params.id),
        }).send(res);
    };

    // Lấy xe theo slug
    getCarBySlug = async (req, res, next) => {
        new OK({
            message: 'Get car success',
            metadata: await carService.getCarBySlug(req.params.slug),
        }).send(res);
    };

    // Cập nhật xe
    updateCar = async (req, res, next) => {
        new OK({
            message: 'Update car success',
            metadata: await carService.updateCar(req.params.id, req.body, req.files),
        }).send(res);
    };

    // Xóa xe
    deleteCar = async (req, res, next) => {
        new OK({
            message: 'Delete car success',
            metadata: await carService.deleteCar(req.params.id),
        }).send(res);
    };

    // Xóa ảnh cụ thể
    deleteImage = async (req, res, next) => {
        new OK({
            message: 'Delete image success',
            metadata: await carService.deleteImage(req.params.id, req.body.imagePath),
        }).send(res);
    };

    // So sánh nhanh 2 xe
    compareCars = async (req, res, next) => {
        const { car1Id, car2Id } = req.body;
        new OK({
            message: 'Compare cars success',
            metadata: await carService.compareCars(car1Id, car2Id),
        }).send(res);
    };

    // Phân tích AI so sánh 2 xe
    aiAnalyzeComparison = async (req, res, next) => {
        const { car1Id, car2Id, requirements, customRequirement } = req.body;
        new OK({
            message: 'AI analysis success',
            metadata: await carService.aiAnalyzeComparison(car1Id, car2Id, requirements, customRequirement),
        }).send(res);
    };
}

module.exports = new CarController();
