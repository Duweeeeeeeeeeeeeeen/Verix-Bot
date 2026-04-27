import mongoose from 'mongoose';

const supportQueueSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], 
        default: 'WAITING' 
    },
    voiceChannelId: { type: String },
    staffId: { type: String },
    isVip: { type: Boolean, default: false },
    deletionScheduledAt: { type: Date, default: null }
});

supportQueueSchema.index({ guildId: 1 });
supportQueueSchema.index({ userId: 1 });
supportQueueSchema.index({ status: 1 });

export default mongoose.model('SupportQueue', supportQueueSchema);
