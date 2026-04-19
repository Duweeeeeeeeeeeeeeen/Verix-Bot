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
    embed: {
        title: {
            type: String,
            default: '✅ Verifica Account'
        },
        description: {
            type: String,
            default: 'Clicca il bottone qui sotto per verificarti e accedere al server!'
        },
        color: {
            type: String,
            default: '#2ecc71'
        }
    },
    dmMessage: {
        type: String,
        default: 'Ti sei verificato correttamente nel server!'
    },
    dmEnabled: {
        type: Boolean,
        default: true
    },
    logEnabled: {
        type: Boolean,
        default: true
    },
    dmEmbed: {
        title: {
            type: String,
            default: '✅ Verifica Completata'
        },
        description: {
            type: String,
            default: 'Benvenuto! Il tuo accesso al server **{guild}** è stato confermato con successo.'
        },
        color: {
            type: String,
            default: '#2ecc71'
        }
    }
});

export default mongoose.model('VerifyConfig', verifyConfigSchema);
