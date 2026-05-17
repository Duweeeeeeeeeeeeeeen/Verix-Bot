import mongoose from 'mongoose';

const userExperienceSchema = new mongoose.Schema({
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    lastXpGain: { type: Date, default: Date.now },
    dailyXpEarned: { type: Number, default: 0 },
    lastXpReset: { type: Date, default: Date.now }
});

// Compound index for leaderboard queries
userExperienceSchema.index({ guildId: 1, xp: -1 });
userExperienceSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export default mongoose.model('UserExperience', userExperienceSchema);
