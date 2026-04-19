import mongoose from 'mongoose';

const photoContestSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'FINISHED'],
        default: 'ACTIVE'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    announcementMessageId: {
        type: String,
        default: null
    },
    winnerId: {
        type: String,
        default: null
    },
    theme: {
        type: String,
        default: null
    }
});

// Performance Indexes
photoContestSchema.index({ guildId: 1 });
photoContestSchema.index({ status: 1 });

export default mongoose.model('PhotoContest', photoContestSchema);
