import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const discordIdRegex = /^\d{17,20}$/;

const embedSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    color: { type: String, default: '#5865F2' },
    footer: { type: String, default: '' },
    image: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    timestamp: { type: Boolean, default: true }
}, { _id: false });

const serverTrackerSchema = new mongoose.Schema({
    id: { type: String, default: uuidv4 }, // Front-end friendly UUID key
    enabled: { type: Boolean, default: true },
    serverIp: { type: String, default: '' },
    statusChannelId: { type: String, default: null, match: discordIdRegex },
    
    // Persistent Discord State
    messageId: { type: String, default: null },
    uptimeStart: { type: Date, default: null },

    onlineMessage: { type: String, default: '' },
    offlineMessage: { type: String, default: '' },
    onlineEmbed: { type: embedSchema, default: () => ({}) },
    offlineEmbed: { type: embedSchema, default: () => ({}) },
    buttons: [{
        label: { type: String, default: 'Connettiti' },
        url: { type: String, default: '' },
        emoji: { type: String, default: '🎮' },
        style: { type: String, default: 'LINK' }
    }]
}, { _id: false });

const fiveMConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true, match: discordIdRegex },
    enabled: { type: Boolean, default: false },
    staffRoleIds: { type: [String], default: [] },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    servers: { type: [serverTrackerSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('FiveMConfig', fiveMConfigSchema);
