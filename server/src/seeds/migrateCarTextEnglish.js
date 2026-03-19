require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/connectDB');
const Car = require('../models/cars.model');

const FUEL_TYPE_MAP = {
    xang: 'Gasoline',
    dau: 'Diesel',
    dien: 'Electric',
    hybrid: 'Hybrid',
    gasoline: 'Gasoline',
    diesel: 'Diesel',
    electric: 'Electric',
};

const TRANSMISSION_MAP = {
    'tu dong': 'Automatic',
    'so san': 'Manual',
    automatic: 'Automatic',
    manual: 'Manual',
};

const COLOR_NAME_MAP = {
    den: 'Black',
    trang: 'White',
    bac: 'Silver',
    do: 'Red',
    'do do': 'Burgundy Red',
    'do ruby': 'Ruby Red',
    'xanh duong': 'Ocean Blue',
    'xanh la': 'Forest Green',
    'xam titanium': 'Titanium Gray',
    'nau dong': 'Copper Brown',
    'den obsidian': 'Obsidian Black',
    'trang ngoc trai': 'Pearl White',
    'bac anh kim': 'Metallic Silver',
};

const VERSION_TEXT_REPLACEMENTS = [
    [/đặc biệt/gi, 'Special'],
    [/cao cấp/gi, 'Premium'],
    [/tiêu chuẩn/gi, 'Standard'],
    [/nâng cao/gi, 'Advanced'],
    [/thể thao/gi, 'Sport'],
];

const VIETNAMESE_HINT_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const normalizeTextKey = (value = '') =>
    value
        .toString()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase();

const normalizeColorName = (value = '') => {
    const normalizedKey = normalizeTextKey(value);
    return COLOR_NAME_MAP[normalizedKey] || value;
};

const normalizeVersionName = (value = '') => {
    if (!value) return value;
    return VERSION_TEXT_REPLACEMENTS.reduce(
        (result, [pattern, replacement]) => result.replace(pattern, replacement),
        value,
    );
};

const normalizeFuelTypeValue = (value = '') => FUEL_TYPE_MAP[normalizeTextKey(value)] || 'Gasoline';
const normalizeTransmissionValue = (value = '') => TRANSMISSION_MAP[normalizeTextKey(value)] || 'Automatic';

const hasVietnameseContent = (value = '') => {
    const lower = value.toString().toLowerCase();
    return (
        VIETNAMESE_HINT_REGEX.test(lower) ||
        /(mau xe|hang|noi that|dong co|van hanh|tiet kiem|phu hop|gia dinh|tien nghi)/i.test(normalizeTextKey(lower))
    );
};

const normalizeDescription = (description = '', carInfo = {}) => {
    if (!description) {
        return `${carInfo?.name || 'This vehicle'} features modern styling, a comfortable interior, advanced safety technology, and efficient daily performance.`;
    }

    if (!hasVietnameseContent(description)) return description;

    const fuelType = normalizeFuelTypeValue(carInfo?.fuelType);
    const transmission = normalizeTransmissionValue(carInfo?.transmission);
    return `${carInfo?.name || 'This vehicle'} features modern styling, a comfortable interior, advanced safety technology, and efficient daily performance. It uses a ${fuelType} powertrain with ${transmission} transmission for smooth driving.`;
};

const run = async () => {
    try {
        await connectDB();

        const cars = await Car.find({});
        let updatedCount = 0;

        for (const car of cars) {
            const normalizedColors = (car.colors || []).map((color) => ({
                ...(color.toObject?.() ? color.toObject() : color),
                name: normalizeColorName(color.name),
            }));

            const normalizedVersions = (car.versions || []).map((version) => ({
                ...(version.toObject?.() ? version.toObject() : version),
                name: normalizeVersionName(version.name),
            }));

            const normalizedDescription = normalizeDescription(car.description, {
                name: car.name,
                fuelType: car.fuelType,
                transmission: car.transmission,
            });
            const normalizedFuelType = normalizeFuelTypeValue(car.fuelType);
            const normalizedTransmission = normalizeTransmissionValue(car.transmission);

            const hasColorChange = JSON.stringify(car.colors) !== JSON.stringify(normalizedColors);
            const hasVersionChange = JSON.stringify(car.versions) !== JSON.stringify(normalizedVersions);
            const hasDescriptionChange = (car.description || '') !== normalizedDescription;
            const hasFuelTypeChange = (car.fuelType || '') !== normalizedFuelType;
            const hasTransmissionChange = (car.transmission || '') !== normalizedTransmission;

            if (
                hasColorChange ||
                hasVersionChange ||
                hasDescriptionChange ||
                hasFuelTypeChange ||
                hasTransmissionChange
            ) {
                await Car.updateOne(
                    { _id: car._id },
                    {
                        $set: {
                            fuelType: normalizedFuelType,
                            transmission: normalizedTransmission,
                            colors: normalizedColors,
                            versions: normalizedVersions,
                            description: normalizedDescription,
                        },
                    },
                );
                updatedCount += 1;
            }
        }

        console.log(`Car text migration completed. Updated ${updatedCount}/${cars.length} cars.`);
    } catch (error) {
        console.error('Car text migration failed:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

run();
