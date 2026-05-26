import mongoose from 'mongoose';

const supportConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    staffRoleIds: { type: [String], default: [] },
    logChannelId: { type: String, default: null },
    voiceSettings: {
        joinChannelId: { type: String, default: null },
        categoryId: { type: String, default: null },
        autoDelete: { type: Boolean, default: true },
        maxConcurrent: { type: Number, default: 1 },
        queueCooldown: { type: Number, default: 2 }, // Minutes
        vipRoleId: { type: String, default: null },
        paused: { type: Boolean, default: false },
        notifications: {
            mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
            channelId: { type: String, default: null }
        },
        pingStaffOnJoin: { type: Boolean, default: true },
        channelNameTemplate: { type: String, default: 'support-{user}' },
        sessionCounter: { type: Number, default: 0 },
        messages: {
            paused: { type: String, default: '**SUPPORT PAUSED:** Voice support is temporarily closed.' },
            cooldown: { type: String, default: 'You requested support too recently. Please wait a few minutes.' },
            queueFull: { type: String, default: 'All support rooms are busy. You are queued and will be moved automatically when a staff member is available.' },
            sessionStart: { type: String, default: '**Support Request Accepted:** You have been moved to a private channel. A staff member will join shortly.' }
        }
    },
    embeds: {
        staffLog: {
            title: { type: String, default: 'New Support Request' },
            description: { type: String, default: 'User {user} requested voice support and is waiting in channel: {voice_channel}.' },
            color: { type: String, default: '#f1c40f' }
        }
    },
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
});

export default mongoose.model('SupportConfig', supportConfigSchema);
