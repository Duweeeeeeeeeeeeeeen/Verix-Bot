import mongoose from 'mongoose';

const whitelistConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'Sistema Whitelist' },
    description: { type: String, default: 'Clicca il pulsante qui sotto per iniziare la tua candidatura.' },
    color: { type: String, default: '#5865F2' },
    panelChannelId: { type: String, default: null },
    panelMessageId: { type: String, default: null },
    lastPanelChannelId: { type: String, default: null },
    lastPanelMessageId: { type: String, default: null },
    categoryOpenId: { type: String, default: null },
    staffRoleIds: { type: [String], default: [] },
    logChannelId: { type: String, default: null },
    questions: [
        {
            text: { type: String, required: true },
            minLength: { type: Number, default: 10 },
            category: { type: String, default: 'Generale' }
        }
    ],
    questionsPerSession: { type: Number, default: 5 },
    timeLimit: { type: Number, default: 30 }, // Minutes
    timeLimitEnabled: { type: Boolean, default: true },
    cooldown: { type: Number, default: 24 }, // Hours
    cooldownEnabled: { type: Boolean, default: true },
    mode: { type: String, enum: ['TEXT', 'VOICE', 'HYBRID'], default: 'TEXT' },
    rolesToAddOnTextPass: { type: [String], default: [] },
    rolesToRemoveOnTextPass: { type: [String], default: [] },
    voiceSettings: {
        joinChannelId: { type: String, default: null },
        categoryId: { type: String, default: null },
        autoDelete: { type: Boolean, default: true },
        maxConcurrent: { type: Number, default: 1 },
        queueCooldown: { type: Number, default: 5 }, // Minutes
        vipRoleId: { type: String, default: null },
        paused: { type: Boolean, default: false },
        dashboardChannelId: { type: String, default: null },
        dashboardMsgId: { type: String, default: null },
        pingStaffOnJoin: { type: Boolean, default: false },
        recentActionsCount: { type: Number, default: 3 },
        rejectionCooldown: { type: Number, default: 24 }, // Hours
        rolesToAdd: { type: [String], default: [] },
        rolesToRemove: { type: [String], default: [] },
        voiceMessages: {
            cooldown: { type: String, default: '⚠️ Hai provato a unirti troppo velocemente. Attendi qualche minuto prima di riprovare.' },
            queueFull: { type: String, default: '⏳ Tutti gli uffici sono occupati. Sei in coda. Verrai spostato automaticamente appena disponibile.' },
            staffApproved: { type: String, default: '✅ Whitelist Vocale approvata da {staff}' },
            staffDenied: { type: String, default: '❌ Whitelist Vocale rifiutata da {staff}' }
        },
        voiceButtons: {
            approve: { 
                label: { type: String, default: 'Accetta' }, 
                emoji: { type: String, default: '✅' }, 
                style: { type: String, default: 'SUCCESS' } 
            },
            deny: { 
                label: { type: String, default: 'Rifiuta' }, 
                emoji: { type: String, default: '❌' }, 
                style: { type: String, default: 'DANGER' } 
            },
            reset: { 
                label: { type: String, default: 'Riavvia Timer' }, 
                emoji: { type: String, default: '⏱️' }, 
                style: { type: String, default: 'SECONDARY' } 
            }
        }
    },
    flowRequirements: {
        requireTextWL: { type: Boolean, default: false },
        requireBackground: { type: Boolean, default: false }
    },
    colors: {
        primary: { type: String, default: '#5865F2' },
        success: { type: String, default: '#2ecc71' },
        error: { type: String, default: '#ff4757' }
    },
    embeds: {
        panel: {
            title: { type: String, default: 'Sistema Whitelist' },
            description: { type: String, default: 'Clicca il pulsante qui sotto per iniziare la tua candidatura.' },
            color: { type: String, default: '#5865F2' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: null },
            fields: { type: [Object], default: [] }
        },
        start: {
            title: { type: String, default: '🛂 Ufficio Immigrazione - Apertura Pratica' },
            description: { type: String, default: 'Benvenuto {user}. Per essere ammesso nella nostra comunità, dobbiamo sottoporti a un colloquio formale.\n\n**DIRETTIVE:**\n- Rispondi onestamente e con dovizia di particolari.\n- Rispetta il limite di tempo per evitare l\'annullamento.\n- Ogni risposta contribuirà al tuo dossier cittadino.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Dipartimento Accoglienza Civile' },
            fields: { type: [Object], default: [
                { name: '⏱️ Tempo Concesso', value: '`{time_limit} minuti`', inline: true },
                { name: '📝 Domande Totali', value: '`{total_questions}`', inline: true },
                { name: '📌 Stato', value: '`In attesa di risposta 1`', inline: true }
            ]}
        },
        question: {
            title: { type: String, default: '❓ Interrogatorio: Domanda {current_index} di {total_questions}' },
            description: { type: String, default: '>>> {question}' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Stai compilando il modulo ministeriale.' },
            fields: { type: [Object], default: [
                { name: '📏 Requisito Dettaglio', value: '`{min_length} caratteri`', inline: true },
                { name: '⏳ Ossigeno Sessione', value: '`{time_left} min`', inline: true }
            ]}
        },
        error_min_length: {
            title: { type: String, default: '⚠️ Nota Informativa: Dettaglio Insufficiente' },
            description: { type: String, default: 'L\'ufficiale addetto richiede maggiore precisione. La tua risposta deve contenere almeno **{min_length}** caratteri per essere archiviata.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        timeout: {
            title: { type: String, default: '⏳ NOTIFICA: Sessione Scaduta' },
            description: { type: String, default: 'La tua sessione di ammissione è terminata per superamento dei tempi previsti.\nIl tuo dossier è stato archiviato come "Incompleto".' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        review: {
            title: { type: String, default: '📋 Revisione Finale Dossier' },
            description: { type: String, default: 'Controlla attentamente le tue dichiarazioni qui sotto. Una volta confermato, il modulo passerà alla commissione di valutazione.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Ufficio di Validazione Documenti' }
        },
        dm_submitted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '📄 Pratica Presa in Carico' },
            description: { type: String, default: 'La tua domanda per {guild} è stata registrata nei nostri sistemi. Sarai avvisato non appena l\'esito sarà disponibile.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '🛂 Benvenuto in Città!' },
            description: { type: String, default: 'Congratulazioni {user}! Il tuo visto per {guild} è stato approvato con successo. Ti aspettiamo ai confini della città.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '❌ Visto Negato' },
            description: { type: String, default: 'Ci dispiace, la commissione di {guild} ha respinto la tua richiesta di accesso.\n\n**Motivazione Ufficiale:**\n>>> {reason}' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        staff_received: {
            title: { type: String, default: '👀 Nuova Pratica Whitelist' },
            description: { type: String, default: 'L\'utente {user} (ID: `{user_id}`) ha inviato una nuova pratica di ammissione.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Firma Elettronica: {app_id}' }
        },
        staff_accepted: {
            title: { type: String, default: '✅ Pratica Validata: ACCETTATA' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: { type: [Object], default: [
                { name: '👤 Cittadino', value: '{user}', inline: true },
                { name: '👮 Ufficiale', value: '{staff}', inline: true },
                { name: '🆔 Dossier ID', value: '`{app_id}`', inline: true }
            ]}
        },
        staff_rejected: {
            title: { type: String, default: '❌ Pratica Respinta: RIFIUTATA' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            fields: { type: [Object], default: [
                { name: '👤 Cittadino', value: '{user}', inline: true },
                { name: '👮 Ufficiale', value: '{staff}', inline: true },
                { name: '🆔 Dossier ID', value: '`{app_id}`', inline: true },
                { name: '📝 Nota Commissione', value: '>>> {reason}', inline: false }
            ]}
        },
        voice_waiting: {
            title: { type: String, default: '🎤 Interrogatorio Vocale Avviato' },
            description: { type: String, default: 'Benvenuto nella stanza audizioni, {user}.\n\nUno psicologo forense o un ufficiale addetto si unirà a breve per completare il tuo dossier.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        voice_staff_log: {
            title: { type: String, default: '🎙️ Segnalazione: Nuova Audizione' },
            description: { type: String, default: 'L\'utente {user} è pronto per l\'interrogatorio vocale nel canale: {voice_channel}.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        voice_error_flow: {
            title: { type: String, default: '❌ Errore Procedurale: Accesso Negato' },
            description: { type: String, default: 'La tua pratica vocale non può procedere per i seguenti motivi ostativi:\n{reason}' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        voice_guide: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '📝 Guida Colloquio RP' },
            description: { type: String, default: 'Benvenuto all\'audizione. Usa i pulsanti sottostanti per gestire l\'esito della sessione.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Sistema Voice Whitelist Professional' },
            fields: { type: [Object], default: [
                { name: '⏱️ Tempo Trascorso', value: '{start_time}', inline: true },
                { name: '✅ Checklist', value: '{checklist}', inline: false }
            ]}
        },
        dm_voice_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '❌ Esito Audizione: NON IDONEO' },
            description: { type: String, default: 'Ci dispiace {user}, la commissione di {guild} ha valutato il tuo colloquio orale come non idoneo.\n\n**Motivazione:**\n>>> {reason}\n\n**PROSSIMA DISPONIBILITÀ:**\nPotrai ripresentarti per un nuovo colloquio tra **{cooldown} ore**.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        }
    }
});

export default mongoose.model('WhitelistConfig', whitelistConfigSchema);
