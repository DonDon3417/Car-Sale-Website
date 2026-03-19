const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');
const Car = require('../models/cars.model');
const Brand = require('../models/brand.model');
const Category = require('../models/category.model');
const slugify = require('slugify');

// Danh sách mẫu xe theo hãng
const carModels = {
    Toyota: ['Camry', 'Corolla Cross', 'Vios', 'Fortuner', 'Land Cruiser', 'Veloz Cross', 'Raize', 'Innova Cross'],
    Honda: ['City', 'Civic', 'CR-V', 'HR-V', 'Accord', 'BR-V'],
    Hyundai: ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Stargazer', 'Ioniq 5'],
    Kia: ['Morning', 'Seltos', 'Sportage', 'Sorento', 'Carnival', 'K3', 'K5'],
    Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-8', 'CX-30'],
    Ford: ['Ranger', 'Everest', 'Territory', 'Explorer'],
    Mitsubishi: ['Xpander', 'Attrage', 'Outlander', 'Pajero Sport', 'Triton'],
    VinFast: ['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9', 'Lux A', 'Lux SA'],
    'Mercedes-Benz': ['C 200', 'C 300 AMG', 'E 200', 'E 300 AMG', 'S 450', 'GLC 200', 'GLC 300', 'GLE 450', 'GLS 450'],
    BMW: ['320i', '330i M Sport', '520i', '530i', 'X1', 'X3', 'X5', 'X7'],
    Audi: ['A4', 'A6', 'A7', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
    Lexus: ['ES 250', 'ES 350', 'RX 350', 'NX 350h', 'LX 600'],
    Chevrolet: ['Trailblazer', 'Colorado'],
    Nissan: ['Navara', 'Almera', 'X-Trail', 'Kicks'],
    Suzuki: ['Ertiga', 'XL7', 'Swift', 'Ciaz', 'Jimny'],
};

// Màu sắc mẫu
const sampleColors = [
    { name: 'Đen Obsidian', code: '#0d0d0d' },
    { name: 'Trắng Ngọc Trai', code: '#f5f5f5' },
    { name: 'Bạc Ánh Kim', code: '#c0c0c0' },
    { name: 'Xám Titanium', code: '#5a5a5a' },
    { name: 'Đỏ Ruby', code: '#9b111e' },
    { name: 'Xanh Dương', code: '#1e3a5f' },
    { name: 'Xanh Lá', code: '#1a472a' },
    { name: 'Nâu Đồng', code: '#8b4513' },
];

// Phiên bản mẫu
const sampleVersions = [
    ['Standard', 'Premium', 'Luxury'],
    ['Base', 'Mid', 'Top'],
    ['G', 'V', 'Q'],
    ['Sport', 'Elegance', 'Signature'],
];

// Ảnh xe từ Unsplash (đã resize nhỏ, tải nhanh)
const carImageUrls = [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80',
    'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80',
];

// Helper: Download image
const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https
            .get(url, (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                    return;
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filepath);
                });
            })
            .on('error', (err) => {
                fs.unlink(filepath, () => {});
                reject(err);
            });
    });
};

// Helper: random
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedCars = async () => {
    try {
        // Lấy brands và categories
        const brands = await Brand.find();
        const categories = await Category.find();

        if (brands.length === 0 || categories.length === 0) {
            console.log('❌ Vui lòng seed brands và categories trước!');
            return;
        }

        // Tạo thư mục uploads nếu chưa có
        const uploadDir = path.join(__dirname, '../uploads/cars');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        console.log('🚗 Bắt đầu tạo 50 xe mẫu...\n');

        // Xóa xe cũ (optional)
        await Car.deleteMany({});
        console.log('✓ Đã xóa xe cũ');

        // Download một số ảnh mẫu
        console.log('📸 Đang tải ảnh mẫu...');
        const localImages = [];
        for (let i = 0; i < carImageUrls.length; i++) {
            const filename = `sample-car-${i + 1}.jpg`;
            const filepath = path.join(uploadDir, filename);
            try {
                await downloadImage(carImageUrls[i], filepath);
                localImages.push(`/uploads/cars/${filename}`);
                process.stdout.write(`  Downloaded ${i + 1}/${carImageUrls.length}\r`);
            } catch (err) {
                console.log(`  ⚠ Không thể tải ảnh ${i + 1}`);
            }
        }
        console.log(`\n✓ Đã tải ${localImages.length} ảnh mẫu`);

        const cars = [];
        let carIndex = 0;

        for (const brand of brands) {
            const models = carModels[brand.name] || [`${brand.name} Model 1`, `${brand.name} Model 2`];

            for (const modelName of models) {
                if (carIndex >= 50) break;

                const category = randomItem(categories);
                const basePrice =
                    brand.name.includes('Mercedes') ||
                    brand.name.includes('BMW') ||
                    brand.name.includes('Audi') ||
                    brand.name.includes('Lexus')
                        ? random(1500000000, 6000000000) // Xe sang
                        : brand.name === 'VinFast' && (modelName.includes('VF8') || modelName.includes('VF9'))
                          ? random(1000000000, 2000000000) // VinFast cao cấp
                          : random(400000000, 1500000000); // Xe phổ thông

                const fuelTypes =
                    brand.name === 'VinFast' ? ['Electric'] : ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];
                const fuelType = randomItem(fuelTypes);

                const versionSet = randomItem(sampleVersions);
                const versions = versionSet.map((name, idx) => ({
                    name,
                    price: basePrice + idx * random(50000000, 150000000),
                }));

                const colorCount = random(3, 6);
                const colors = [];
                const usedColors = new Set();
                while (colors.length < colorCount) {
                    const color = randomItem(sampleColors);
                    if (!usedColors.has(color.name)) {
                        colors.push(color);
                        usedColors.add(color.name);
                    }
                }

                const imageCount = random(2, 4);
                const images = [];
                for (let i = 0; i < imageCount; i++) {
                    if (localImages.length > 0) {
                        images.push(localImages[random(0, localImages.length - 1)]);
                    }
                }

                const fullName = `${brand.name} ${modelName}`;
                const car = {
                    name: fullName,
                    slug: slugify(fullName, { lower: true, strict: true }) + '-' + Date.now() + '-' + carIndex,
                    brand: brand._id,
                    category: category._id,
                    price: basePrice,
                    discountPrice: Math.random() > 0.7 ? basePrice - random(10000000, 100000000) : 0,
                    year: random(2022, 2025),
                    fuelType,
                    transmission: randomItem(['Automatic', 'Manual']),
                    seats: randomItem([4, 5, 7, 8]),
                    engine:
                        fuelType === 'Electric'
                            ? `${random(150, 400)}kW Electric Motor`
                            : `${(random(15, 40) / 10).toFixed(1)}L ${randomItem(['I4', 'V6', 'V8', 'Turbo'])}`,
                    mileage: fuelType === 'Electric' ? random(15, 25) : random(6, 15),
                    colors,
                    versions,
                    images,
                    description: `${fullName} features modern styling, strong performance, advanced safety technologies, and a comfortable cabin for both daily commuting and long trips.`,
                    specifications: {
                        length: `${random(4200, 5200)}`,
                        width: `${random(1750, 2000)}`,
                        height: `${random(1400, 1900)}`,
                        wheelBase: `${random(2600, 3100)}`,
                        horsepower: `${random(100, 600)}`,
                        torque: `${random(150, 900)}`,
                    },
                    stock: random(1, 10),
                    viewCount: random(0, 5000),
                    status: randomItem(['available', 'available', 'available', 'coming_soon']),
                };

                cars.push(car);
                carIndex++;
            }

            if (carIndex >= 50) break;
        }

        // Insert vào DB
        const createdCars = await Car.insertMany(cars);
        console.log(`\n✅ Đã tạo ${createdCars.length} xe:`);

        // Hiển thị một số xe mẫu
        createdCars.slice(0, 10).forEach((car, idx) => {
            console.log(`  ${idx + 1}. ${car.name} - ${(car.price / 1000000000).toFixed(2)} tỷ`);
        });
        if (createdCars.length > 10) {
            console.log(`  ... và ${createdCars.length - 10} xe khác`);
        }

        console.log('\n✅ Seed cars hoàn thành!');
    } catch (error) {
        console.error('❌ Lỗi seed cars:', error.message);
    }
};

module.exports = seedCars;

// Chạy trực tiếp
if (require.main === module) {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });

    mongoose
        .connect(process.env.CONNECT_DB || 'mongodb://localhost:27017/ban-oto')
        .then(() => {
            console.log('📦 Đã kết nối MongoDB\n');
            return seedCars();
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
