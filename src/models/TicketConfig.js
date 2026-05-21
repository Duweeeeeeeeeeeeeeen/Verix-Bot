import mongoose from 'mongoose';

const ticketConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    closeMode: { type: String, enum: ['MOVE', 'DELETE'], default: 'DELETE' },
    inputType: { type: String, enum: ['BUTTONS', 'SELECT'], default: 'SELECT' },
    panelChannelId: { type: String },
    panelMessageId: { type: String, default: null },
    categoryOpenId: { type: String },
    categoryClosedId: { type: String },
    staffRoleIds: { type: [String], default: [] },
    logChannelId: { type: String },
    enabledTypes: { 
        type: [String], 
        default: ['support', 'report', 'whitelist', 'staff', 'other'] 
    },
    notifications: {
        mode: { type: String, enum: ['DM', 'CHANNEL', 'BOTH', 'NONE'], default: 'DM' },
        channelId: { type: String, default: null }
    },
    typesConfig: {
        type: Map,
        of: {
            label: { type: String }, // Optional custom label
            color: { type: String, default: '#3498db' },
            emoji: { type: String, default: '🎫' },
            style: { type: String, default: 'PRIMARY' },
            url: { type: String, default: null },
            image: { type: String, default: null },
            pingRoleId: { type: String, default: null },
            order: { type: Number, default: 0 },
            welcomeMessage: { type: String, default: null }
        },
        default: {
            'support': { label: 'General Support', color: '#6366f1', emoji: '??' },
            'report': { label: 'User Report', color: '#ef4444', emoji: '??' },
            'donation': { label: 'Donations', color: '#f59e0b', emoji: '??' },
            'bug': { label: 'Bug Report', color: '#10b981', emoji: '??' }
        }
    },
    transcriptionEnabled: { type: Boolean, default: true },
    inactivityTimeout: { type: Number, default: 24 }, // Hours before auto-close
    cannedResponses: [{
        label: { type: String, required: true },
        content: { type: String, required: true }
    }],
    blacklist: { type: [String], default: [] },
    autoClose: {
        enabled: { type: Boolean, default: false },
        hours: { type: Number, default: 24 }
    },
    panelImage: { type: String, default: null },
    embeds: {
        panel: {
            title: { type: String, default: 'Support Center' },
            description: { type: String, default: 'Need help or want to report something to staff? Open a ticket by selecting the correct category.' },
            color: { type: String, default: '#2ECC71' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Support Team | {guild}' }
        },
        ticket: {
            title: { type: String, default: '{emoji} Ticket: {type}' },
            description: { type: String, default: 'Welcome, <@{user_id}>. A staff member will handle your request shortly.\n\n**DETAILS:**\n- Priority: `{priority}`\n- Status: `{status}`' },
            color: { type: String, default: '#2ECC71' }
        },
        close: {
            title: { type: String, default: 'Ticket Closed' },
            description: { type: String, default: 'This ticket has been closed and archived.' },
            color: { type: String, default: '#E74C3C' }
        }
    },
    messages: {
        cooldown: { type: String, default: null },
        alreadyExists: { type: String, default: null },
        successOpen: { type: String, default: null },
        successClose: { type: String, default: null },
        staffClaimed: { type: String, default: null }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    },
    buttons: {
        claim: { 
            label: { type: String, default: 'Claim' }, 
            emoji: { type: String, default: '🙋‍♂️' }, 
            style: { type: String, default: 'SUCCESS' } 
        },
        close: { 
            label: { type: String, default: 'Close' }, 
            emoji: { type: String, default: '🔒' }, 
            style: { type: String, default: 'DANGER' } 
        },
        quickReply: { 
            label: { type: String, default: 'Quick Replies' }, 
            emoji: { type: String, default: '📝' }, 
            style: { type: String, default: 'PRIMARY' } 
        },
        tag: { 
            label: { type: String, default: 'Tag' }, 
            emoji: { type: String, default: '🏷️' }, 
            style: { type: String, default: 'SECONDARY' } 
        },
        transcript: { 
            label: { type: String, default: 'Logs' }, 
            emoji: { type: String, default: '📄' }, 
            style: { type: String, default: 'SECONDARY' } 
        }
    }
});

export default mongoose.model('TicketConfig', ticketConfigSchema);
