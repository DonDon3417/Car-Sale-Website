const Car = require('../models/cars.model');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

class CarService {
    // Tạo xe mới
    async createCar(data, files) {
        try {
            // Tạo slug từ tên xe
            data.slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();

            // Convert price và discountPrice sang số (do FormData gửi lên dạng string)
            if (data.price !== undefined) {
                data.price = Number(data.price);
            }
            if (data.discountPrice !== undefined) {
                data.discountPrice = Number(data.discountPrice) || 0;
            }

            // Xử lý images từ multer
            if (files && files.length > 0) {
                data.images = files.map((file) => `/uploads/cars/${file.filename}`);
            }

            // Parse JSON fields nếu được gửi dưới dạng string
            if (typeof data.colors === 'string') {
                data.colors = JSON.parse(data.colors);
            }
            if (typeof data.versions === 'string') {
                data.versions = JSON.parse(data.versions);
            }
            // Ensure version prices are numbers
            if (data.versions && Array.isArray(data.versions)) {
                data.versions = data.versions.map((v) => ({
                    ...v,
                    price: Number(v.price) || 0,
                }));
            }
            if (typeof data.specifications === 'string') {
                data.specifications = JSON.parse(data.specifications);
            }

            const car = new Car(data);
            await car.save();

            return await Car.findById(car._id).populate('brand', 'name').populate('category', 'name');
        } catch (error) {
            throw error;
        }
    }

    // Lấy tất cả xe (có filter nâng cao)
    async getAllCars(query = {}) {
        try {
            const {
                page = 1,
                limit = 12,
                brand,
                category,
                minPrice,
                maxPrice,
                fuelType,
                transmission,
                status,
                search,
                minYear,
                maxYear,
                seats,
                sortBy = 'createdAt',
                sortOrder = 'desc',
            } = query;

            const filter = {};

            // Filter by brand (support multiple)
            if (brand) {
                if (Array.isArray(brand)) {
                    filter.brand = { $in: brand };
                } else if (brand.includes(',')) {
                    filter.brand = { $in: brand.split(',') };
                } else {
                    filter.brand = brand;
                }
            }

            // Filter by category (support multiple)
            if (category) {
                if (Array.isArray(category)) {
                    filter.category = { $in: category };
                } else if (category.includes(',')) {
                    filter.category = { $in: category.split(',') };
                } else {
                    filter.category = category;
                }
            }

            // Filter by fuel type (support multiple)
            if (fuelType) {
                if (Array.isArray(fuelType)) {
                    filter.fuelType = { $in: fuelType };
                } else if (fuelType.includes(',')) {
                    filter.fuelType = { $in: fuelType.split(',') };
                } else {
                    filter.fuelType = fuelType;
                }
            }

            // Filter by transmission
            if (transmission) filter.transmission = transmission;

            // Filter by status
            if (status) filter.status = status;

            // Filter by price range
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }

            // Filter by year range
            if (minYear || maxYear) {
                filter.year = {};
                if (minYear) filter.year.$gte = Number(minYear);
                if (maxYear) filter.year.$lte = Number(maxYear);
            }

            // Filter by seats
            if (seats) {
                if (Array.isArray(seats)) {
                    filter.seats = { $in: seats.map(Number) };
                } else if (String(seats).includes(',')) {
                    filter.seats = { $in: seats.split(',').map(Number) };
                } else {
                    filter.seats = Number(seats);
                }
            }

            // Search by name
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { 'brand.name': { $regex: search, $options: 'i' } },
                ];
            }

            const skip = (Number(page) - 1) * Number(limit);

            // Sort options
            const sortOptions = {};
            const validSortFields = ['createdAt', 'price', 'year', 'viewCount', 'name'];
            if (validSortFields.includes(sortBy)) {
                sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            } else {
                sortOptions.createdAt = -1;
            }

            const [cars, total] = await Promise.all([
                Car.find(filter)
                    .populate('brand', 'name')
                    .populate('category', 'name')
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(Number(limit)),
                Car.countDocuments(filter),
            ]);

            return {
                cars,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                },
                filters: {
                    brand,
                    category,
                    minPrice,
                    maxPrice,
                    fuelType,
                    transmission,
                    status,
                    search,
                    minYear,
                    maxYear,
                    seats,
                    sortBy,
                    sortOrder,
                },
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy xe theo ID hoặc slug
    async getCarById(id) {
        try {
            const car = await Car.findById(id).populate('brand', 'name').populate('category', 'name');
            if (!car) throw new Error('Car not found');
            return car;
        } catch (error) {
            throw error;
        }
    }

    async getCarBySlug(slug) {
        try {
            const car = await Car.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } }, { new: true })
                .populate('brand', 'name')
                .populate('category', 'name');
            if (!car) throw new Error('Car not found');
            return car;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật xe
    async updateCar(id, data, files) {
        try {
            const car = await Car.findById(id);
            if (!car) throw new Error('Car not found');

            // Cập nhật slug nếu name thay đổi
            if (data.name && data.name !== car.name) {
                data.slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
            }

            // Convert price và discountPrice sang số (do FormData gửi lên dạng string)
            if (data.price !== undefined) {
                data.price = Number(data.price);
            }
            if (data.discountPrice !== undefined) {
                data.discountPrice = Number(data.discountPrice) || 0;
            }

            // Xử lý images mới từ multer
            if (files && files.length > 0) {
                const newImages = files.map((file) => `/uploads/cars/${file.filename}`);

                // Nếu có oldImages (giữ lại ảnh cũ)
                if (data.oldImages) {
                    const oldImages = typeof data.oldImages === 'string' ? JSON.parse(data.oldImages) : data.oldImages;
                    data.images = [...oldImages, ...newImages];
                } else {
                    data.images = newImages;
                }
                delete data.oldImages;
            } else if (data.oldImages) {
                data.images = typeof data.oldImages === 'string' ? JSON.parse(data.oldImages) : data.oldImages;
                delete data.oldImages;
            }

            // Parse JSON fields
            if (typeof data.colors === 'string') {
                data.colors = JSON.parse(data.colors);
            }
            if (typeof data.versions === 'string') {
                data.versions = JSON.parse(data.versions);
            }
            // Ensure version prices are numbers
            if (data.versions && Array.isArray(data.versions)) {
                data.versions = data.versions.map((v) => ({
                    ...v,
                    price: Number(v.price) || 0,
                }));
            }
            if (typeof data.specifications === 'string') {
                data.specifications = JSON.parse(data.specifications);
            }

            const updatedCar = await Car.findByIdAndUpdate(id, data, { new: true })
                .populate('brand', 'name')
                .populate('category', 'name');

            return updatedCar;
        } catch (error) {
            throw error;
        }
    }

    // Xóa xe
    async deleteCar(id) {
        try {
            const car = await Car.findById(id);
            if (!car) throw new Error('Car not found');

            // Xóa ảnh trong thư mục uploads
            if (car.images && car.images.length > 0) {
                car.images.forEach((imagePath) => {
                    const fullPath = path.join(__dirname, '../../', imagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                });
            }

            await Car.findByIdAndDelete(id);
            return car;
        } catch (error) {
            throw error;
        }
    }

    // Xóa ảnh cụ thể
    async deleteImage(carId, imagePath) {
        try {
            const car = await Car.findById(carId);
            if (!car) throw new Error('Car not found');

            // Xóa ảnh khỏi mảng
            car.images = car.images.filter((img) => img !== imagePath);
            await car.save();

            // Xóa file
            const fullPath = path.join(__dirname, '../../', imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }

            return car;
        } catch (error) {
            throw error;
        }
    }

    // So sánh nhanh 2 xe
    async compareCars(car1Id, car2Id) {
        const { quickCompare } = require('../utils/AIAnalysis');
        return await quickCompare(car1Id, car2Id);
    }

    // Phân tích AI so sánh 2 xe
    async aiAnalyzeComparison(car1Id, car2Id, requirements, customRequirement) {
        const { analyzeCarComparison } = require('../utils/AIAnalysis');
        return await analyzeCarComparison(car1Id, car2Id, requirements, customRequirement);
    }
}

module.exports = new CarService();
