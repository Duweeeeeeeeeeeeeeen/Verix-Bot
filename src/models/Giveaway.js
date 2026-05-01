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
        unique: true,
        sparse: true // Allows multiple nulls for scheduled giveaways
    },
    prize: {
        type: String,
        required: true
    },
    winnerCount: {
        type: Number,
        default: 1
    },
    startTime: {
        type: Date,
        default: Date.now
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
        enum: ['SCHEDULED', 'ACTIVE', 'ENDED'],
        default: 'ACTIVE'
    },
    hostId: {
        type: String,
        required: true
    },
    customTitle: String,
    customDescription: String,
    color: {
        type: String,
        default: '#5865F2'
    }
}, { timestamps: true });

export default mongoose.model('Giveaway', giveawaySchema);
