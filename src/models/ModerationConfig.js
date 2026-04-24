import mongoose from 'mongoose';

const moderationConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    
    // [ ANTI SPAM ]
    antispam: {
        enabled: { type: Boolean, default: false },
        maxMessages: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 5000 }, // ms
    },

    // [ CAPS LOCK ]
    capsLock: {
        enabled: { type: Boolean, default: false },
        minCharacters: { type: Number, default: 10 },
        percentage: { type: Number, default: 70 }, // % of caps
    },

    // [ MENTION SPAM ]
    mentionSpam: {
        enabled: { type: Boolean, default: false },
        limit: { type: Number, default: 5 }, // Max mentions per message
    },

    // [ BLACKLIST ]
    blacklist: {
        enabled: { type: Boolean, default: false },
        words: { type: [String], default: [] },
    },

    // [ PUNISHMENTS ]
    punishments: {
        type: [{
            level: { type: Number, required: true },
            action: { type: String, enum: ['warn', 'timeout', 'mute', 'kick', 'ban'], required: true },
            duration: { type: Number, default: 0 }, // minutes
            message: { type: String, default: '' }
        }],
        default: [
            { level: 1, action: 'warn', message: '⚠️ {user}, primo avviso per comportamento scorretto.' },
            { level: 2, action: 'timeout', duration: 10, message: '🔇 {user}, sei stato messo in timeout per 10 minuti.' },
            { level: 3, action: 'kick', message: '👢 {user}, espulso dal server per infrazioni multiple.' }
        ]
    },

    // [ ECCEZIONI ]
    ignoredRoles: { type: [String], default: [] },
    ignoredChannels: { type: [String], default: [] },
    
    // Global reset
    resetTime: { type: Number, default: 30 }

}, { timestamps: true });

export default mongoose.model('ModerationConfig', moderationConfigSchema);
