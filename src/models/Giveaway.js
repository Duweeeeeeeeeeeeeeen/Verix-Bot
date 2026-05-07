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
    },
    buttonLabel: {
        type: String,
        default: 'Partecipa'
    },
    buttonEmoji: {
        type: String,
        default: '🎉'
    },
    buttonStyle: {
        type: String,
        default: 'PRIMARY'
    }
}, { timestamps: true });

// Performance Indexes — queried every 60s in the GiveawayManager loop
giveawaySchema.index({ status: 1, endTime: 1 });   // checkGiveaways: find ACTIVE past endTime
giveawaySchema.index({ status: 1, startTime: 1 }); // checkGiveaways: find SCHEDULED past startTime
giveawaySchema.index({ guildId: 1, status: 1 });   // dashboard: filter by guild + status

// TTL Index: auto-delete ENDED giveaways after 90 days to keep collection lean
// MongoDB checks this index periodically (~60s) and removes expired docs automatically
giveawaySchema.index({ updatedAt: 1 }, {
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days
    partialFilterExpression: { status: 'ENDED' } // only affects ENDED giveaways
});

export default mongoose.model('Giveaway', giveawaySchema);
