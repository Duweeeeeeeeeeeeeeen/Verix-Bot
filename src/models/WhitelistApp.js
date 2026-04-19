import mongoose from 'mongoose';

const whitelistAppSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'WAITING_VOICE'], default: 'PENDING' },
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
    deletionScheduledAt: { type: Date, default: null }
});

// Performance Indexes
whitelistAppSchema.index({ guildId: 1 });
whitelistAppSchema.index({ userId: 1 });
whitelistAppSchema.index({ status: 1 });
whitelistAppSchema.index({ guildId: 1, status: 1 });
whitelistAppSchema.index({ guildId: 1, userId: 1, status: 1 });

export default mongoose.model('WhitelistApp', whitelistAppSchema);
