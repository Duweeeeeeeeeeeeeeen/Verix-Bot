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
        channelNameTemplate: { type: String, default: 'assistenza-{user}' },
        sessionCounter: { type: Number, default: 0 },
        messages: {
            paused: { type: String, default: '⏸️ **ASSISTENZA SOSPESA:** Il servizio di assistenza vocale è temporaneamente chiuso.' },
            cooldown: { type: String, default: '⚠️ Hai richiesto assistenza troppo recentemente. Attendi qualche minuto.' },
            queueFull: { type: String, default: '⏳ Tutti gli uffici assistenza sono occupati. Sei in coda. Verrai spostato automaticamente appena un operatore si libera.' },
            sessionStart: { type: String, default: '🎧 **Richiesta Presa in Carico:** Sei stato spostato in un canale privato. Un operatore dello staff si unirà a breve.' }
        }
    },
    embeds: {
        staffLog: {
            title: { type: String, default: '🆘 Nuova Richiesta Assistenza' },
            description: { type: String, default: 'L\'utente {user} ha richiesto assistenza vocale ed è in attesa nel canale: {voice_channel}.' },
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
