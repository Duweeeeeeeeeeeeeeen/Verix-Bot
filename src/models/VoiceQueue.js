import mongoose from 'mongoose';

const voiceQueueSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'], 
        default: 'WAITING' 
    },
    voiceChannelId: { type: String }, // The temp VC created for them
    logMessageId: { type: String }, // The staff log message to update
    staffId: { type: String },
    staffJoinedAt: { type: Date },
    isVip: { type: Boolean, default: false },
    deletionScheduledAt: { type: Date, default: null }
});

// Performance Indexes
voiceQueueSchema.index({ guildId: 1 });
voiceQueueSchema.index({ userId: 1 });
voiceQueueSchema.index({ status: 1 });
voiceQueueSchema.index({ guildId: 1, status: 1 }); // Used in cleanup ghost sessions
// Sparse index: only indexes documents where deletionScheduledAt != null
voiceQueueSchema.index({ deletionScheduledAt: 1 }, { sparse: true });

export default mongoose.model('VoiceQueue', voiceQueueSchema);
