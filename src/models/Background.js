import mongoose from 'mongoose';

const backgroundSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    link: { type: String },
    description: { type: String },
    attachmentURL: { type: String },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED'], 
        default: 'PENDING' 
    },
    reviewedBy: { type: String },
    rejectionReason: { type: String },
    channelId: { type: String }, // Temporary channel ID
    createdAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    deletionScheduledAt: { type: Date, default: null }
});

export default mongoose.model('Background', backgroundSchema);
