const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatSessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        messages: [chatMessageSchema],
        interestScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        level: {
            type: String,
            enum: ['Cold', 'Warm', 'Hot'],
            default: 'Cold',
        },
        reason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    },
);

chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ level: 1 });
chatSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
