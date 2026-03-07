const categoryService = require('../services/category.service');
const { Created, OK } = require('../core/success.response');

class CategoryController {
    createCategory = async (req, res, next) => {
        new Created({
            message: 'Create category success',
            metadata: await categoryService.createCategory(req.body),
        }).send(res);
    };

    getAllCategories = async (req, res, next) => {
        new OK({
            message: 'Get all categories success',
            metadata: await categoryService.getAllCategories(),
        }).send(res);
    };

    updateCategory = async (req, res, next) => {
        new OK({
            message: 'Update category success',
            metadata: await categoryService.updateCategory(req.params.id, req.body),
        }).send(res);
    };

    deleteCategory = async (req, res, next) => {
        new OK({
            message: 'Delete category success',
            metadata: await categoryService.deleteCategory(req.params.id),
        }).send(res);
    };
}

module.exports = new CategoryController();
