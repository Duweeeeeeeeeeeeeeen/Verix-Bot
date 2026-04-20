import mongoose from 'mongoose';

const whitelistConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    title: { type: String, default: '🛂 Ufficio Immigrazione - Richiesta di Cittadinanza' },
    description: { type: String, default: 'Benvenuto. Se desideri stabilirti stabilmente nel nostro Stato, devi prima sottoporti a una valutazione d\'idoneità da parte del Dipartimento Civile.' },
    color: { type: String, default: '#3BA4FF' },
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
    mode: { type: String, enum: ['BG_ONLY', 'TEXT', 'VOICE', 'BG_TEXT', 'BG_VOICE', 'HYBRID', 'FULL'], default: 'TEXT' },
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
            cooldown: { type: String, default: '⚠️ **ACCESSO NEGATO:** Hai provato a forzare l\'udienza troppo velocemente. Attendi la finestra temporale autorizzata.' },
            queueFull: { type: String, default: '⏳ **SALA D\'ATTESA PIENA:** Gli uffici sono attualmente sovraccarichi. Sei in coda per il prossimo colloquio disponibile.' },
            staffApproved: { type: String, default: '✅ **VISTO CONCESSO:** La tua idoneità vocale è stata confermata da {staff}.' },
            staffDenied: { type: String, default: '❌ **COLLOQUIO FALLITO:** Procedura interrotta da {staff}.' }
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
            title: { type: String, default: '🛂 Pratica d\'Ingresso: {user}' },
            description: { type: String, default: 'Benvenuto cittadino. Per essere ammesso ufficialmente, dobbiamo compilare il tuo dossier informativo.\n\n**DIRETTIVE MINISTERIALI:**\n• Rispondi onestamente e con dovizia di particolari.\n• Rispetta i protocolli di tempo per evitare l\'annullamento dell\'istanza.\n• Ogni dichiarazione verrà registrata nel tuo archivio civile.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Dipartimento di Accoglienza Civile | Verix RP' },
            fields: { type: [Object], default: [
                { name: '⏱️ Tempo Autorizzato', value: '`{time_limit} minuti`', inline: true },
                { name: '📝 Protocolli Domande', value: '`{total_questions}`', inline: true },
                { name: '📌 Stato Istanza', value: '`In attesa di deposizione...`', inline: true }
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
            title: { type: String, default: '⏳ NOTIFICA: Tempo Scaduto' },
            description: { type: String, default: 'La sessione è terminata perché è trascorso troppo tempo. Per ragioni di sicurezza, i dati sono stati archiviati come incompleti.' },
            color: { type: String, default: 'error' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        review: {
            title: { type: String, default: '📋 Validazione Finale del Dossier' },
            description: { type: String, default: 'Rileggi attentamente le tue dichiarazioni istituzionali. Una volta confermate, la tua istanza passerà alla Commissione Superiore per il verdetto finale.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null },
            footer: { type: String, default: 'Ufficio Validazione Documenti | Verix RP' }
        },
        dm_submitted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '📄 Pratica Ricevuta' },
            description: { type: String, default: 'La tua domanda per {guild} è ora nelle mani dello staff. Riceverai un aggiornamento non appena avremo esaminato il tuo dossier.' },
            color: { type: String, default: 'primary' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_accepted: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '🛂 VISTO CONCESSO: Benvenuto in Città!' },
            description: { type: String, default: 'Congratulazioni {user}! Il tuo visto di residenza per {guild} è stato approvato dalla Commissione.\nTi auguriamo una permanenza sicura e prospera ai confini dello Stato.' },
            color: { type: String, default: 'success' },
            image: { type: String, default: null },
            thumbnail: { type: String, default: null }
        },
        dm_rejected: {
            enabled: { type: Boolean, default: true },
            title: { type: String, default: '❌ VISTO NEGATO: Pratica Archiviata' },
            description: { type: String, default: 'Gentile utente, la Commissione per l\'Immigrazione di {guild} ha respinto la tua istanza di cittadinanza.\n\n**MOTIVAZIONE UFFICIALE:**\n>>> {reason}' },
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
