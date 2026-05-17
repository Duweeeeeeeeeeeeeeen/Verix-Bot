import mongoose from 'mongoose';

const staffAppSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    type: { type: String, default: 'STAFF' }, // Can be used for different staff roles later
    answers: [{ 
        question: String,
        answer: String
    }],
    status: { 
        type: String, 
        enum: ['PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED'], 
        default: 'PENDING' 
    },
    reviewedBy: { type: String },
    rejectionReason: { type: String },
    channelId: { type: String }, // Temporary channel ID if needed
    createdAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    deletionScheduledAt: { type: Date, default: null }
});

staffAppSchema.index({ guildId: 1 });
staffAppSchema.index({ userId: 1 });
staffAppSchema.index({ guildId: 1, userId: 1 });
staffAppSchema.index({ deletionScheduledAt: 1 }, { sparse: true });

export default mongoose.model('StaffApp', staffAppSchema);
