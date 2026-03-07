const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const controllerBrand = require('../controller/brand.controller');

router.post('/create', asyncHandler(controllerBrand.createBrand));
router.get('/', asyncHandler(controllerBrand.getAllBrands));
router.put('/:id', asyncHandler(controllerBrand.updateBrand));
router.delete('/:id', asyncHandler(controllerBrand.deleteBrand));

module.exports = router;
