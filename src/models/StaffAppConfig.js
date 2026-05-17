import mongoose from 'mongoose';

const staffAppConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    logChannelId: { type: String },
    panelChannelId: { type: String },
    panelMessageId: { type: String, default: null },
    staffRoleIds: { type: [String], default: [] }, // Roles that can review
    roleToAssignOnSubmit: { type: String }, // Role given while waiting
    roleToAssignOnAccept: { type: String }, // Final staff role
    cooldown: { type: Number, default: 48 }, // Hours
    questions: [{
        text: String,
        minLength: { type: Number, default: 50 }
    }],
    colors: {
        primary: { type: String, default: '#a855f7' }, // Purple theme for staff
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    embeds: {
        panel: {
            title: { type: String, default: '🛡️ Reclutamento Staff - Portale Candidature' },
            description: { type: String, default: 'Vuoi entrare a far parte del nostro team? Inviando la tua candidatura verrai valutato dai responsabili HR.\n\nAssicurati di rispondere in modo esaustivo a tutte le domande.' },
            color: { type: String, default: 'primary' },
            button: {
                label: { type: String, default: 'Candidati Ora' },
                emoji: { type: String, default: '🛡️' },
                style: { type: String, default: 'PRIMARY' }
            }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '🎊 Candidatura Accettata!' },
            description: { type: String, default: 'Ottime notizie {user}! La tua candidatura per lo staff di {guild} è stata approvata. Benvenuto nel team!' },
            color: { type: String, default: 'success' }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '❌ Candidatura Respinta' },
            description: { type: String, default: 'Siamo spiacenti {user}, ma la tua candidatura per {guild} non è stata approvata.\n\n**Motivazione:**\n>>> {reason}' },
            color: { type: String, default: 'error' }
        }
    },
    systemMessages: {
        type: Map,
        of: String,
        default: {}
    }
});

export default mongoose.model('StaffAppConfig', staffAppConfigSchema);
