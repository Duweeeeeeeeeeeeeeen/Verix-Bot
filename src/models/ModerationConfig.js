import mongoose from 'mongoose';

const moderationConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    logChannelId: { type: String, default: null },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    
    // [ ANTI SPAM ]
    antispam: {
        enabled: { type: Boolean, default: false },
        maxMessages: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 5000 }, // ms
    },
    antiRepeat: {
        enabled: { type: Boolean, default: false },
        maxDuplicates: { type: Number, default: 3 },
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

    // [ ANTI LINK ]
    antiLink: {
        enabled: { type: Boolean, default: false },
        whitelist: { type: [String], default: [] }, // Allowed domains
        allowRoles: { type: [String], default: [] },
        allowChannels: { type: [String], default: [] }
    },

    // [ ANTI INVITE ]
    antiInvite: {
        enabled: { type: Boolean, default: false },
        allowRoles: { type: [String], default: [] },
        allowChannels: { type: [String], default: [] }
    },

    // [ ANTI EVERYONE ]
    antiEveryone: {
        enabled: { type: Boolean, default: false },
        action: { type: String, enum: ['delete', 'warn', 'none'], default: 'delete' }
    },

    // [ GHOST PING ]
    ghostPing: {
        enabled: { type: Boolean, default: false },
        logInChannel: { type: Boolean, default: true }
    },

    // [ ANTI FLOOD ]
    antiFlood: {
        enabled: { type: Boolean, default: false },
        maxLines: { type: Number, default: 10 },
        maxCharacters: { type: Number, default: 1000 },
        maxEmojis: { type: Number, default: 15 }
    },

    // [ ANTI RAID / AUTO QUARANTINE ]
    antiRaid: {
        enabled: { type: Boolean, default: false },
        joinsThreshold: { type: Number, default: 10 },
        timeWindow: { type: Number, default: 10000 }, // 10 seconds
        action: { type: String, enum: ['lockdown', 'notify', 'quarantine'], default: 'notify' },
        quarantineRoleId: { type: String, default: null },
        lockdownChannels: { type: [String], default: [] }
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
    resetTime: { type: Number, default: 30 },

    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }

}, { timestamps: true });

export default mongoose.model('ModerationConfig', moderationConfigSchema);
