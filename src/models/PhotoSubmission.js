import mongoose from 'mongoose';

const photoSubmissionSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhotoContest',
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    messageId: {
        type: String,
        required: true
    },
    upvotes: {
        type: [String],
        default: []
    },
    downvotes: {
        type: [String],
        default: []
    },
    score: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Ensure one submission per user per contest
photoSubmissionSchema.index({ contestId: 1, userId: 1 }, { unique: true });
photoSubmissionSchema.index({ guildId: 1 });
photoSubmissionSchema.index({ guildId: 1, createdAt: -1 });

export default mongoose.model('PhotoSubmission', photoSubmissionSchema);
