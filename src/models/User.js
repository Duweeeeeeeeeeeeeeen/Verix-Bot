import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    username: String,
    joinedAt: {
        type: Date,
        default: Date.now
    },
    // Example fields for economy/premium system expansion
    balance: {
        type: Number,
        default: 0
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    lastDaily: {
        type: Date,
        default: null
    },
    lastWhitelistAttempt: {
        type: Date,
        default: null
    },
    lastBackgroundAttempt: {
        type: Date,
        default: null
    },
    photoWins: {
        type: Number,
        default: 0
    }
});

// Performance Indexes for Leaderboards
userSchema.index({ xp: -1 });
userSchema.index({ photoWins: -1 });
userSchema.index({ level: -1 });

export default mongoose.model('User', userSchema);
