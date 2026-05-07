import mongoose from 'mongoose';

const whitelistAppSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'WAITING_VOICE', 'WAITING_BACKGROUND', 'SUBMITTED_BACKGROUND'], default: 'PENDING' },
    currentQuestionIndex: { type: Number, default: 0 },
    sessionQuestions: [
        {
            text: String,
            minLength: Number
        }
    ],
    answers: [
        {
            question: String,
            answer: String
        }
    ],
    submittedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },
    startTime: { type: Date, default: Date.now },
    reviewMessageId: { type: String, default: null },
    lastVoiceRejectionAt: { type: Date, default: null },
    deletionScheduledAt: { type: Date, default: null }
});

// Performance Indexes
whitelistAppSchema.index({ guildId: 1 });
whitelistAppSchema.index({ userId: 1 });
whitelistAppSchema.index({ status: 1 });
whitelistAppSchema.index({ guildId: 1, status: 1 });
whitelistAppSchema.index({ guildId: 1, userId: 1, status: 1 });
// Sparse index: only indexes documents where deletionScheduledAt != null (avoids Full Collection Scan)
whitelistAppSchema.index({ deletionScheduledAt: 1 }, { sparse: true });

export default mongoose.model('WhitelistApp', whitelistAppSchema);
