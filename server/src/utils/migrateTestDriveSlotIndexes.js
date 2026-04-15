const mongoose = require('mongoose');

const TARGET_INDEX_NAME = 'car_1_date_1_timeSlot_1';
const LEGACY_INDEX_NAME = 'date_1_timeSlot_1';

const migrateTestDriveSlotIndexes = async () => {
    const db = mongoose.connection.db;
    if (!db) {
        return;
    }

    const collectionName = 'testdriveslots';
    const hasCollection = await db.listCollections({ name: collectionName }, { nameOnly: true }).hasNext();

    if (!hasCollection) {
        return;
    }

    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();

    const legacyIndex = indexes.find((index) => index.name === LEGACY_INDEX_NAME);
    if (legacyIndex) {
        await collection.dropIndex(LEGACY_INDEX_NAME);
        console.log('[Migration] Dropped legacy index testdriveslots.date_1_timeSlot_1');
    }

    const targetIndex = indexes.find((index) => index.name === TARGET_INDEX_NAME);
    if (!targetIndex) {
        await collection.createIndex({ car: 1, date: 1, timeSlot: 1 }, { unique: true, name: TARGET_INDEX_NAME });
        console.log('[Migration] Created index testdriveslots.car_1_date_1_timeSlot_1 (unique)');
    }
};

module.exports = migrateTestDriveSlotIndexes;
