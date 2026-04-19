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
            title: { type: String, default: '✅ Verifica Account' },
            description: { type: String, default: 'Clicca il bottone qui sotto per verificarti e accedere al server!' },
            color: { type: String, default: '#2ecc71' },
            image: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
            footer: { type: String, default: '' }
        },
        dm: {
            title: { type: String, default: '✅ Verifica Completata' },
            description: { type: String, default: 'Benvenuto! Il tuo accesso al server **{guild}** è stato confermato con successo.' },
            color: { type: String, default: '#2ecc71' },
            image: { type: String, default: '' },
            thumbnail: { type: String, default: '' },
            footer: { type: String, default: '' }
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
        alreadyVerified: { type: String, default: 'ℹ️ Sei già verificato nel server!' },
        successResponse: { type: String, default: '✅ Ti sei verificato con successo!' },
        errorResponse: { type: String, default: '❌ Si è verificato un errore durante la verifica.' }
    },
    dmEnabled: {
        type: Boolean,
        default: true
    },
    logEnabled: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model('VerifyConfig', verifyConfigSchema);
