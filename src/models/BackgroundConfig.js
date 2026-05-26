import mongoose from 'mongoose';

const backgroundConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String },
    staffRoleIds: { type: [String], default: [] },
    rolesToAdd: { type: [String], default: [] },
    rolesToRemove: { type: [String], default: [] },
    panelChannelId: { type: String },
    panelMessageId: { type: String, default: null },
    cooldown: { type: Number, default: 24 }, // Hours for Panel
    correctionCooldown: { type: Number, default: 2 }, // Hours for Integrated Correction
    enabled: { type: Boolean, default: true },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    entryPoint: { type: String, enum: ['PANEL', 'INTEGRATED'], default: 'PANEL' },
    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    embeds: {
        panel: {
            title: { type: String, default: 'Background Submission' },
            description: { type: String, default: 'Submit a background document for staff review. Make sure your link is accessible to reviewers.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            button: {
                label: { type: String, default: 'Submit Background' },
                emoji: { type: String, default: '📖' },
                style: { type: String, default: 'PRIMARY' }
            }
        },
        instructions: {
            title: { type: String, default: 'Submission Instructions' },
            description: { type: String, default: 'Hi {user}. Use this channel to prepare your attachments and submit your official background for staff review.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_received: {
            title: { type: String, default: 'Background Received' },
            description: { type: String, default: 'Your background for {guild} has been received. Staff will review it soon.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Background Approved!' },
            description: { type: String, default: 'Great news {user}! Your background for {guild} has been approved.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: 'Background Rejected' },
            description: { type: String, default: 'Your background for {guild} was not approved.\n\n**Reason:**\n>>> {reason}' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        staff_received: {
            title: { type: String, default: 'Background Review' },
            description: { type: String, default: 'User: {user}\nID: `{user_id}`\n\n**Summary:**\n>>> {bg_desc}\n\n**Document:** [Open Document]({bg_link})' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: {
                type: [{ name: String, value: String, inline: Boolean }],
                default: [
                    { name: 'Additional Attachments', value: '{bg_attachment}', inline: false }
                ]
            }
        },
        staff_accepted: {
            title: { type: String, default: 'Background Approved' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: {
                type: [{ name: String, value: String, inline: Boolean }],
                default: [
                    { name: 'User', value: '{user}', inline: true },
                    { name: 'Reviewer', value: '{staff}', inline: true }
                ]
            }
        },
        staff_rejected: {
            title: { type: String, default: 'Background Rejected' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: {
                type: [{ name: String, value: String, inline: Boolean }],
                default: [
                    { name: 'User', value: '{user}', inline: true },
                    { name: 'Reviewer', value: '{staff}', inline: true },
                    { name: 'Staff Note', value: '>>> {reason}', inline: false }
                ]
            }
        },
        integrated_accepted: {
            title: { type: String, default: 'Background Approved!' },
            description: { type: String, default: 'Great news {user}! Your background has been approved. When you are ready, click the button below to start the written test.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        integrated_rejected: {
            title: { type: String, default: 'Background Feedback' },
            description: { type: String, default: 'Hi {user}, your background needs changes before it can be approved.\n\n**Reason:**\n>>> {reason}\n\nYou can submit an updated version in about **{next_attempt}**.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }
});

export default mongoose.model('BackgroundConfig', backgroundConfigSchema);
