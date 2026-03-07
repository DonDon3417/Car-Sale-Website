const brandService = require('../services/brand.service');
const { Created, OK } = require('../core/success.response');

class BrandController {
    createBrand = async (req, res, next) => {
        new Created({
            message: 'Create brand success',
            metadata: await brandService.createBrand(req.body),
        }).send(res);
    };

    getAllBrands = async (req, res, next) => {
        new OK({
            message: 'Get all brands success',
            metadata: await brandService.getAllBrands(),
        }).send(res);
    };

    updateBrand = async (req, res, next) => {
        new OK({
            message: 'Update brand success',
            metadata: await brandService.updateBrand(req.params.id, req.body),
        }).send(res);
    };

    deleteBrand = async (req, res, next) => {
        new OK({
            message: 'Delete brand success',
            metadata: await brandService.deleteBrand(req.params.id),
        }).send(res);
    };
}

module.exports = new BrandController();
