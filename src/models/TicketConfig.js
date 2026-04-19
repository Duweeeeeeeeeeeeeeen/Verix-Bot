import mongoose from 'mongoose';

const ticketConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    panelChannelId: { type: String },
    panelMessageId: { type: String, default: null },
    categoryOpenId: { type: String },
    categoryClosedId: { type: String },
    staffRoleIds: { type: [String], default: [] },
    logChannelId: { type: String },
    enabledTypes: { 
        type: [String], 
        default: ['supporto', 'segnalazione', 'whitelist', 'staff', 'altro'] 
    },
    typesConfig: {
        type: Map,
        of: {
            color: { type: String, default: '#3498db' },
            emoji: { type: String, default: '🎫' },
            image: { type: String, default: null }
        },
        default: {
            'supporto': { color: '#3498db', emoji: '🆘' },
            'segnalazione': { color: '#e74c3c', emoji: '🚨' },
            'whitelist': { color: '#2ecc71', emoji: '🛂' },
            'staff': { color: '#9b59b6', emoji: '💎' },
            'altro': { color: '#95a5a6', emoji: '📁' }
        }
    },
    transcriptionEnabled: { type: Boolean, default: true },
    inactivityTimeout: { type: Number, default: 24 }, // Hours before auto-close
    cannedResponses: [{
        label: { type: String, required: true },
        content: { type: String, required: true }
    }],
    panelImage: { type: String, default: null }
});

export default mongoose.model('TicketConfig', ticketConfigSchema);
