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
    panelImage: { type: String, default: null },
    embeds: {
        panel: {
            title: { type: String, default: '🎫 Centro Assistenza' },
            description: { type: String, default: 'Seleziona una categoria dal menu a tendina per aprire un ticket.' },
            color: { type: String, default: '#3498db' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: null }
        },
        ticket: {
            title: { type: String, default: '{emoji} Ticket: {type}' },
            description: { type: String, default: 'Bentornato <@{user_id}>, lo staff ti assisterà a breve.\n\n**Metadati Sessione:**\n• Priorità: `{priority}`\n• Stato: `{status}`' },
            color: { type: String, default: '#3498db' }
        },
        close: {
            title: { type: String, default: '📁 Archivio Ticket' },
            description: { type: String, default: 'Il ticket è stato chiuso.' },
            color: { type: String, default: '#ff4757' }
        }
    },
    messages: {
        cooldown: { type: String, default: '⚠️ Attendi qualche minuto prima di aprire un altro ticket.' },
        alreadyExists: { type: String, default: '❌ Hai già un ticket di tipo **{type}** attivo.' },
        successOpen: { type: String, default: '✅ Ticket creato: {channel}' },
        successClose: { type: String, default: '🛡️ **Chiusura professionale...**' },
        staffClaimed: { type: String, default: '✅ {staff} ha preso in carico il ticket.' }
    },
    buttons: {
        claim: { 
            label: { type: String, default: 'Assumi' }, 
            emoji: { type: String, default: '🙋‍♂️' }, 
            style: { type: String, default: 'SUCCESS' } 
        },
        close: { 
            label: { type: String, default: 'Chiudi' }, 
            emoji: { type: String, default: '🔒' }, 
            style: { type: String, default: 'DANGER' } 
        },
        quickReply: { 
            label: { type: String, default: 'Risposte Rapide' }, 
            emoji: { type: String, default: '📝' }, 
            style: { type: String, default: 'PRIMARY' } 
        },
        tag: { 
            label: { type: String, default: 'Tagga' }, 
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
