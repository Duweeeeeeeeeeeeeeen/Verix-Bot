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
        default: ['whitelist', 'tickets', 'voice', 'verify', 'logs', 'background', 'support']
    },
    
    // White-label Premium features
    customBotName: { type: String, default: null },
    customStatus: { type: String, default: null },
    hideBranding: { type: Boolean, default: false }
});

export default mongoose.model('Guild', guildSchema);
