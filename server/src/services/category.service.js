const Category = require('../models/category.model');

class CategoryService {
    async createCategory(data) {
        try {
            const category = new Category(data);
            await category.save();
            return category;
        } catch (error) {
            throw error;
        }
    }

    async getAllCategories() {
        try {
            const categories = await Category.find({}).sort({ createdAt: -1 });
            return categories;
        } catch (error) {
            throw error;
        }
    }

    async updateCategory(id, data) {
        try {
            const category = await Category.findByIdAndUpdate(id, data, { new: true });
            if (!category) throw new Error('Category not found');
            return category;
        } catch (error) {
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            const category = await Category.findByIdAndDelete(id);
            if (!category) throw new Error('Category not found');
            return category;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CategoryService();
