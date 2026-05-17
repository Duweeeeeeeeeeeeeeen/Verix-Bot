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
        default: ['supporto', 'segnalazione', 'whitelist', 'staff', 'altro'] 
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
            'supporto': { label: 'Supporto Generale', color: '#6366f1', emoji: '🎫' },
            'segnalazione': { label: 'Segnalazione Utente', color: '#ef4444', emoji: '🚨' },
            'donazione': { label: 'Donazioni', color: '#f59e0b', emoji: '💰' },
            'bug': { label: 'Segnalazione Bug', color: '#10b981', emoji: '🐛' }
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
            title: { type: String, default: '🎫 Segretariato: Sportello al Cittadino' },
            description: { type: String, default: 'Hai bisogno di supporto o desideri segnalare qualcosa allo staff? Apri un ufficio assistenza selezionando il dipartimento corretto.' },
            color: { type: String, default: '#2ECC71' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Dipartimento Pubbliche Relazioni | Verix RP' }
        },
        ticket: {
            title: { type: String, default: '{emoji} Pratica {type} - In Carico' },
            description: { type: String, default: 'Benvenuto allo sportello assistenziale, <@{user_id}>. Un operatore prenderà in carico la tua richiesta a breve.\n\n**DETTAGLI PROTOCOLLO:**\n• Priorità Operativa: `{priority}`\n• Stato Corrente: `{status}`' },
            color: { type: String, default: '#2ECC71' }
        },
        close: {
            title: { type: String, default: '📂 Archivio: Pratica Conclusa' },
            description: { type: String, default: 'La documentazione di questo ufficio è stata depositata correttamente negli archivi.' },
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
