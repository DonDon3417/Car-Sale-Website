const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const depositSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },

        car: {
            type: Schema.Types.ObjectId,
            ref: 'Car',
            required: true,
        },

        carVersion: {
            type: String,
            default: '',
        },

        carColor: {
            type: String,
            default: '',
        },

        depositAmount: {
            type: Number,
            required: true,
        },

        carPrice: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ['MOMO', 'VNPAY', 'PAYPAL'],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },

        transactionId: {
            type: String,
            default: '',
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },

        note: {
            type: String,
            default: '',
        },

        customerPhone: {
            type: String,
            default: '',
        },

        expiresAt: {
            type: Date,
            default: function () {
                return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            },
        },

        confirmedAt: {
            type: Date,
        },

        cancelledAt: {
            type: Date,
        },

        cancelReason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    },
);

// Tự động tính số tiền đặt cọc = 10% giá xe
depositSchema.pre('save', function (next) {
    if (this.isNew && !this.depositAmount) {
        this.depositAmount = Math.round(this.carPrice * 0.1);
    }
    next();
});

module.exports = mongoose.model('Deposit', depositSchema);
