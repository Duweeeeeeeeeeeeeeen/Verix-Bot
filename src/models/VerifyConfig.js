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
            title: { type: String, default: '🛡️ Checkpoint di Sicurezza - Dogana' },
            description: { type: String, default: 'Per garantire l\'incolumità dei cittadini, è necessario confermare la tua identità prima di attraversare la dogana e accedere alla città.' },
            color: { type: String, default: '#9146FF' },
            image: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
            footer: { type: String, default: 'Dipartimento di Sicurezza Nazionale | Verix RP' },
            fields: { type: Array, default: [] }
        },
        dm: {
            title: { type: String, default: '✅ Identità Confermata' },
            description: { type: String, default: 'Ottime notizie cittadino! La tua registrazione presso **{guild}** è stata confermata correttamente. Ora puoi attraversare i cancelli della città.' },
            color: { type: String, default: '#2ecc71' },
            image: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
            footer: { type: String, default: 'Dipartimento Doganale | Verix RP' },
            fields: { type: Array, default: [] }
        }
    },
    buttons: {
        verify: {
            label: { type: String, default: 'Verificati Ora' },
            emoji: { type: String, default: '✅' },
            style: { type: String, default: 'SUCCESS' }
        }
    },
    messages: {
        alreadyVerified: { type: String, default: 'ℹ️ **PROTOCOLLO ATTIVO:** Risulti già registrato nel database cittadino.' },
        successResponse: { type: String, default: '✅ **IDENTITÀ VALIDATA:** Benvenuto oltre il perimetro.' },
        errorResponse: { type: String, default: '❌ **ERRORE DI SISTEMA:** Impossibile validare i documenti al momento.' }
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
