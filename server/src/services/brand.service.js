const Brand = require('../models/brand.model');

class BrandService {
    async createBrand(data) {
        try {
            const brand = new Brand(data);
            await brand.save();
            return brand;
        } catch (error) {
            throw error;
        }
    }

    async getAllBrands() {
        try {
            const brands = await Brand.find({}).sort({ createdAt: -1 });
            return brands;
        } catch (error) {
            throw error;
        }
    }

    async updateBrand(id, data) {
        try {
            const brand = await Brand.findByIdAndUpdate(id, data, { new: true });
            if (!brand) throw new Error('Brand not found');
            return brand;
        } catch (error) {
            throw error;
        }
    }

    async deleteBrand(id) {
        try {
            const brand = await Brand.findByIdAndDelete(id);
            if (!brand) throw new Error('Brand not found');
            return brand;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BrandService();
