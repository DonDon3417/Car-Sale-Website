const mongoose = require('mongoose');
const Category = require('../models/category.model');

const categories = [
    { name: 'Sedan' },
    { name: 'SUV' },
    { name: 'Crossover' },
    { name: 'Hatchback' },
    { name: 'MPV' },
    { name: 'Pickup / Bán tải' },
    { name: 'Coupe' },
    { name: 'Sport / Thể thao' },
    { name: 'Convertible / Mui trần' },
    { name: 'Electric / Xe điện' },
    { name: 'Luxury / Xe sang' },
];

const seedCategories = async () => {
    try {
        await Category.deleteMany({});
        console.log('✓ Đã xóa categories cũ');

        const createdCategories = await Category.insertMany(categories);
        console.log(`✓ Đã tạo ${createdCategories.length} danh mục:`);
        createdCategories.forEach((cat, idx) => {
            console.log(`  ${idx + 1}. ${cat.name}`);
        });

        console.log('\n✅ Seed categories thành công!');
    } catch (error) {
        console.error('❌ Lỗi seed categories:', error.message);
    }
};

module.exports = seedCategories;

if (require.main === module) {
    require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

    mongoose
        .connect(process.env.CONNECT_DB || 'mongodb://localhost:27017/ban-oto')
        .then(() => {
            console.log('📦 Đã kết nối MongoDB');
            return seedCategories();
        })
        .then(() => {
            mongoose.connection.close();
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Lỗi:', err.message);
            process.exit(1);
        });
}
