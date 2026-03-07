const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../auth/checkAuth');
const controllerCategory = require('../controller/category.controller');

router.post('/create', asyncHandler(controllerCategory.createCategory));
router.get('/', asyncHandler(controllerCategory.getAllCategories));
router.put('/:id', asyncHandler(controllerCategory.updateCategory));
router.delete('/:id', asyncHandler(controllerCategory.deleteCategory));

module.exports = router;
