import mongoose from 'mongoose';

const verifyConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    channelId: {
        type: String,
        default: ''
    },
    panelMessageId: {
        type: String,
        default: null
    },
    lastPanelChannelId: {
        type: String,
        default: null
    },
    lastPanelMessageId: {
        type: String,
        default: null
    },
    roleId: {
        type: String,
        default: ''
    },
    removeRoleId: {
        type: String,
        default: ''
    },
    logChannelId: {
        type: String,
        default: ''
    },
    embeds: {
        panel: {
            title: { type: String, default: 'Server Verification' },
            description: { type: String, default: 'Click the button below to verify your account and unlock the server.' },
            color: { type: String, default: '#9146FF' },
            image: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
            footer: { type: String, default: 'Security System | {guild}' },
            fields: { type: Array, default: [] }
        },
        dm: {
            title: { type: String, default: 'Verification Complete' },
            description: { type: String, default: 'You have been verified in **{guild}**. Welcome!' },
            color: { type: String, default: '#2ecc71' },
            image: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
            footer: { type: String, default: 'Security System | {guild}' },
            fields: { type: Array, default: [] }
        }
    },
    buttons: {
        verify: {
            label: { type: String, default: 'Verify' },
            emoji: { type: String, default: '✅' },
            style: { type: String, default: 'SUCCESS' }
        }
    },
    messages: {
        alreadyVerified: { type: String, default: 'You are already verified.' },
        successResponse: { type: String, default: 'Verification completed successfully.' },
        errorResponse: { type: String, default: 'Could not verify your account right now. Please try again later.' }
    },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    logEnabled: {
        type: Boolean,
        default: true
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

export default mongoose.model('VerifyConfig', verifyConfigSchema);
