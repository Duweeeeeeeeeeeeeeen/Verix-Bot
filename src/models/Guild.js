import mongoose from 'mongoose';

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    guildName: String,
    joinedAt: {
        type: Date,
        default: Date.now
    },
    // Configuration fields
    prefix: {
        type: String,
        default: '!'
    },
    logChannelId: {
        type: String,
        default: null
    },
    welcomeChannelId: {
        type: String,
        default: null
    },

    isPremium: {
        type: Boolean,
        default: false
    },

    enabledModules: {
        type: [String],
        default: ['whitelist', 'tickets', 'voice', 'verify', 'economy', 'logs', 'background', 'support']
    }
});

export default mongoose.model('Guild', guildSchema);
