const Mongoose = require('mongoose');
require('dotenv').config();
const migrateTestDriveSlotIndexes = require('../utils/migrateTestDriveSlotIndexes');

const connectDB = async () => {
    try {
        await Mongoose.connect(process.env.CONNECT_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await migrateTestDriveSlotIndexes();
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};

module.exports = connectDB;
