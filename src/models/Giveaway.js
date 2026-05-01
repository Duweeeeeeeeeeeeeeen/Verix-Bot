import mongoose from 'mongoose';

const giveawaySchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    prize: {
        type: String,
        required: true
    },
    winnerCount: {
        type: Number,
        default: 1
    },
    endTime: {
        type: Date,
        required: true
    },
    participants: {
        type: [String],
        default: []
    },
    winners: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'ENDED'],
        default: 'ACTIVE'
    },
    hostId: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Giveaway', giveawaySchema);
