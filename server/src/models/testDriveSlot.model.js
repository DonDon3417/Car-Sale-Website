const mongoose = require('mongoose');

const testDriveSlotSchema = new mongoose.Schema(
    {
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        timeSlot: {
            type: String,
            required: true,
            enum: [
                '08:00',
                '08:30',
                '09:00',
                '09:30',
                '10:00',
                '10:30',
                '11:00',
                '11:30',
                '13:00',
                '13:30',
                '14:00',
                '14:30',
                '15:00',
                '15:30',
                '16:00',
                '16:30',
                '17:00',
            ],
        },
    },
    {
        timestamps: true,
    },
);

testDriveSlotSchema.index({ car: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('TestDriveSlot', testDriveSlotSchema);
