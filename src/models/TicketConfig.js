import mongoose from 'mongoose';

const ticketConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    closeMode: { type: String, enum: ['MOVE', 'DELETE'], default: 'DELETE' },
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
            label: { type: String }, // Optional custom label
            color: { type: String, default: '#3498db' },
            emoji: { type: String, default: '🎫' },
            image: { type: String, default: null }
        },
        default: {
            'supporto': { label: 'Supporto Generale', color: '#3498db', emoji: '🆘' },
            'segnalazione': { label: 'Segnalazione Staff', color: '#e74c3c', emoji: '🚨' },
            'whitelist': { label: 'Whitelist RP', color: '#2ecc71', emoji: '🛂' },
            'staff': { label: 'Contatto Staff', color: '#9b59b6', emoji: '💎' },
            'altro': { label: 'Altro / Varie', color: '#95a5a6', emoji: '📁' }
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
        cooldown: { type: String, default: '⚠️ **TRAFFICO ELEVATO:** Attendi qualche minuto prima di presentare una nuova istanza allo sportello.' },
        alreadyExists: { type: String, default: '❌ **PRATICA PENDENTE:** Hai già un faldone di tipo **{type}** aperto.' },
        successOpen: { type: String, default: '✅ **RICHIESTA PROTOCOLLATA:** Recati allo sportello {channel}.' },
        successClose: { type: String, default: '🛡️ **ARCHIVIAZIONE IN CORSO...**' },
        staffClaimed: { type: String, default: '✅ **{staff}** ha preso in carico la gestione della pratica.' }
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
