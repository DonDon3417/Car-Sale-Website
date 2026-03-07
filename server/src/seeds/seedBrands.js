const mongoose = require('mongoose');
const Brand = require('../models/brand.model');

// Danh sách 15 hãng xe phổ biến tại Việt Nam
const brands = [
    { name: 'Toyota' },
    { name: 'Honda' },
    { name: 'Hyundai' },
    { name: 'Kia' },
    { name: 'Mazda' },
    { name: 'Ford' },
    { name: 'Mitsubishi' },
    { name: 'VinFast' },
    { name: 'Mercedes-Benz' },
    { name: 'BMW' },
    { name: 'Audi' },
    { name: 'Lexus' },
    { name: 'Chevrolet' },
    { name: 'Nissan' },
    { name: 'Suzuki' },
];

const seedBrands = async () => {
    try {
        // Xóa tất cả brands hiện có (optional)
        await Brand.deleteMany({});
        console.log('✓ Đã xóa brands cũ');

        // Thêm brands mới
        const createdBrands = await Brand.insertMany(brands);
        console.log(`✓ Đã tạo ${createdBrands.length} hãng xe:`);
        createdBrands.forEach((brand, idx) => {
            console.log(`  ${idx + 1}. ${brand.name}`);
        });

        console.log('\n✅ Seed brands thành công!');
    } catch (error) {
        console.error('❌ Lỗi seed brands:', error.message);
    }
};

module.exports = seedBrands;

// Chạy trực tiếp nếu gọi từ command line
if (require.main === module) {
    require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

    mongoose
        .connect(process.env.CONNECT_DB || 'mongodb://localhost:27017/ban-oto')
        .then(() => {
            console.log('📦 Đã kết nối MongoDB');
            return seedBrands();
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
