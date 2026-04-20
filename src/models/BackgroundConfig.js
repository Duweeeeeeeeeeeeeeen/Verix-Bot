import mongoose from 'mongoose';

const backgroundConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    logChannelId: { type: String },
    staffRoleIds: { type: [String], default: [] },
    panelChannelId: { type: String },
    panelMessageId: { type: String, default: null },
    cooldown: { type: Number, default: 24 }, // Hours for Panel
    correctionCooldown: { type: Number, default: 2 }, // Hours for Integrated Correction
    enabled: { type: Boolean, default: true },
    entryPoint: { type: String, enum: ['PANEL', 'INTEGRATED'], default: 'PANEL' },
    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    embeds: {
        panel: {
            title: { type: String, default: '📖 Archivio Storico - Deposito Background' },
            description: { type: String, default: 'Benvenuto cittadino. In questa sezione puoi depositare il dossier relativo alla storia del tuo personaggio.\n\nAssicurati che il collegamento fornito (es. Google Doc) sia accessibile agli ufficiali.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        instructions: {
            title: { type: String, default: '📝 Direttive di Compilazione' },
            description: { type: String, default: 'Salve {user}.\n\nUtilizza questo canale per preparare i tuoi allegati (immagini, documenti PDF). Quando sei pronto, procedi con l\'invio del modulo ufficiale per sottoporre la tua storia alla commissione.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_received: {
            title: { type: String, default: '✅ Dossier Background Ricevuto' },
            description: { type: String, default: 'Il tuo dossier per {guild} è stato correttamente archiviato nei nostri sistemi. Un ufficiale della commissione lo revisionerà a breve.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '🎊 Storia Approvata!' },
            description: { type: String, default: 'Ottime notizie {user}! Il background del tuo personaggio per {guild} è stato validato ufficialmente.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '❌ Storia Respinta' },
            description: { type: String, default: 'Il dossier del tuo personaggio per {guild} non ha superato la revisione.\n\n**Motivazione Ufficiale:**\n>>> {reason}' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        staff_received: {
            title: { type: String, default: '👀 Revisione Dossier Personaggio' },
            description: { type: String, default: 'Utente: {user}\nID: `{user_id}`\n\n**Sintesi:**\n>>> {bg_desc}\n\n**Documentazione:** [Consultabile Qui]({bg_link})' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: {
                type: [{ name: String, value: String, inline: Boolean }],
                default: [
                    { name: '📎 Allegati Aggiuntivi', value: '{bg_attachment}', inline: false }
                ]
            }
        },
        staff_accepted: {
            title: { type: String, default: '✅ Dossier VALIDATO' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: {
                type: [{ name: String, value: String, inline: Boolean }],
                default: [
                    { name: '👤 Soggetto', value: '{user}', inline: true },
                    { name: '👮 Ufficiale', value: '{staff}', inline: true }
                ]
            }
        },
        staff_rejected: {
            title: { type: String, default: '❌ Dossier RESPINTO' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: {
                type: [{ name: String, value: String, inline: Boolean }],
                default: [
                    { name: '👤 Soggetto', value: '{user}', inline: true },
                    { name: '👮 Ufficiale', value: '{staff}', inline: true },
                    { name: '📝 Nota Commissione', value: '>>> {reason}', inline: false }
                ]
            }
        },
        integrated_accepted: {
            title: { type: String, default: '🎊 Storia Approvata!' },
            description: { type: String, default: 'Ottime notizie {user}! La tua storia è stata validata ufficialmente dalla commissione.\n\nQuando sei pronto, clicca il pulsante qui sotto per iniziare il **Test Scritto**.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        integrated_rejected: {
            title: { type: String, default: '⚠️ Revisione Storia: Feedback Staff' },
            description: { type: String, default: 'Salve {user},\n\nIl tuo background ha bisogno di alcune correzioni prima di poter procedere.\n\n**Motivo del Rifiuto:**\n>>> {reason}\n\n**Cosa fare ora?**\nPotrai inviare nuovamente il tuo dossier corretto tra circa **{next_attempt}**. Prendi questo tempo per migliorare la tua storia seguendo le indicazioni dello staff.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        }
    }
});

export default mongoose.model('BackgroundConfig', backgroundConfigSchema);
