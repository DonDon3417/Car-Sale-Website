const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const carSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
        },

        brand: {
            type: Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        discountPrice: {
            type: Number,
            default: 0,
        },

        year: {
            type: Number,
            required: true,
        },

        fuelType: {
            type: String,
            enum: ['Gasoline', 'Diesel', 'Hybrid', 'Electric'],
            required: true,
        },

        transmission: {
            type: String,
            enum: ['Manual', 'Automatic'],
            required: true,
        },

        seats: {
            type: Number,
            required: true,
        },

        engine: {
            type: String,
        },

        mileage: {
            type: Number, // mức tiêu hao nhiên liệu
        },

        colors: [
            {
                name: String,
                code: String, // mã màu (VD: #ffffff)
            },
        ],

        versions: [
            {
                name: String, // Standard, Premium, Luxury
                price: Number,
            },
        ],

        images: [
            {
                type: String,
            },
        ],

        description: {
            type: String,
        },

        specifications: {
            length: String,
            width: String,
            height: String,
            wheelBase: String,
            horsepower: String,
            torque: String,
        },

        stock: {
            type: Number,
            default: 1,
        },

        viewCount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ['available', 'out_of_stock', 'coming_soon'],
            default: 'available',
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Car', carSchema);
