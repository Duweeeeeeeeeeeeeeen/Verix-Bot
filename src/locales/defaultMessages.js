/**
 * Default "Human RP" Messages for all modules.
 * These are used as standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Protocollo di Sicurezza',
            description: 'Spiacente, ma non sembri avere le autorizzazioni necessarie per eseguire questa operazione. Contatta un superiore se ritieni si tratti di un errore.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Comunicato di Rete',
            description: 'Il modulo **{module}** è attualmente disattivato in questa circoscrizione. Riprova più tardi o contatta lo staff.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Gerarchia Status',
            description: 'Impossibile assegnare lo status **{role}**. I protocolli impediscono al bot di gestire ruoli pari o superiori al suo nell\'organigramma del server.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ Anomalia di Sistema',
            description: 'Si è verificato un errore imprevisto durante l\'elaborazione dei dati. I tecnici sono stati informati.',
            color: '#e74c3c'
        }
    },
    whitelist: {
        panel: {
            title: '🛂 Ufficio Immigrazione - Ingresso in Città',
            description: 'Benvenuto nel portale di accesso. Per risiedere stabilmente in città, devi sottoporti a una valutazione d\'idoneità civile.\n\nAssicurati di rispondere onestamente ai protocolli che ti verranno sottoposti.',
            color: '#3BA4FF',
            footer: 'Dipartimento Civile | Verix RP'
        },
        start: {
            title: '📄 Pratica d\'Ingresso: {user}',
            description: 'Benvenuto cittadino. Per essere ammesso ufficialmente, dobbiamo compilare il tuo dossier informativo.\n\n**DIRETTIVE MINISTERIALI:**\n• Rispondi onestamente e con dovizia di particolari.\n• Rispetta i protocolli di tempo per evitare l\'annullamento dell\'istanza.',
            color: '#3BA4FF',
            footer: 'Ufficio Accoglienza | Verix RP'
        },
        question: {
            title: '❓ Interrogatorio: Domanda {current_index} di {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Validazione Finale del Dossier',
            description: 'Rileggi attentamente le tue dichiarazioni istituzionali. Una volta confermate, la tua istanza passerà alla Commissione Superiore per il verdetto finale.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Configurazione Incompleta',
            description: 'La procedura per entrare in città non è ancora stata ultimata dallo staff. Per favore, pazienta ancora un po\'.',
            color: '#f1c40f'
        },
        active_session: {
            title: '📄 Pratica in Corso',
            description: 'Risulta già un dossier aperto a tuo nome nel canale <#{channelId}>. Concludi quella procedura prima di iniziarne una nuova.',
            color: '#3498db'
        },
        already_submitted: {
            title: '📂 Dossier in Valutazione',
            description: 'La tua documentazione è già stata consegnata e si trova attualmente sulla scrivania dello staff. Riceverai un esito a breve.',
            color: '#3498db'
        },
        already_passed: {
            title: '✅ Cittadinanza Già Ottenuta',
            description: 'I nostri registri indicano che sei già un cittadino regolare di **{guild}**. Non è necessario ripetere la procedura.',
            color: '#2ecc71'
        },
        cooldown: {
            title: '⚠️ Protocollo Cooldown',
            description: 'La tua ultima richiesta è stata respinta recentemente. Per ragioni burocratiche, devi attendere **{time}** prima di poter presentare un nuovo dossier.',
            color: '#e74c3c'
        },
        start_success: {
            title: '✅ Percorso Avviato',
            description: 'Il tuo dossier è stato aperto correttamente. Dirigiti nel canale <#{channelId}> per iniziare il colloquio scritto.',
            color: '#2ecc71'
        },
        session_completed: {
            title: '📝 Colloquio Trascritto',
            description: 'Hai risposto a tutte le domande del colloquio. Lo staff analizzerà la tua candidatura a breve.\n\nControlla le tue risposte qui sopra e usa i pulsanti per confermare o annullare\'invio.',
            color: '#3498db'
        },
        min_length_error: {
            title: '⚠️ Dettaglio Insufficiente',
            description: 'La tua risposta deve contenere almeno **{minLength}** caratteri per essere considerata valida. Prova a spiegarti un po\' meglio.',
            color: '#f1c40f'
        }
    },
    tickets: {
        panel: {
            title: '🎫 Segretariato: Sportello al Cittadino',
            description: 'Hai bisogno di supporto o desideri segnalare qualcosa allo staff? Apri un ufficio assistenza selezionando il dipartimento corretto.',
            color: '#2ECC71',
            footer: 'Dipartimento Pubbliche Relazioni | Verix RP'
        },
        ticket: {
            title: '📂 Pratica Assistenziale - In Carico',
            description: 'Benvenuto allo sportello, <@{user_id}>. Un operatore prenderà in carico la tua richiesta a breve.\n\n**DETTAGLI:**\n• Stato: `Aperto`\n• Canale: <#{channel_id}>',
            color: '#2ECC71'
        },
        close: {
            title: '🔒 Archivio: Pratica Conclusa',
            description: 'La documentazione di questo ufficio è stata depositata correttamente negli archivi.',
            color: '#E74C3C'
        },
        already_claimed: {
            title: '🙋‍♂️ Ufficio Già Preso in Carico',
            description: 'Questa pratica è già gestita dall\'ufficiale <@${assignedStaffId}>.',
            color: '#f1c40f'
        },
        status_updated: {
            title: '🔄 Protocollo Aggiornato',
            description: 'La pratica è stata impostata ufficialmente sullo stato: **{status}**.',
            color: '#3498db'
        },
        default_welcome: {
            title: '🎫 Richiesta di Supporto',
            description: 'Benvenuto nell\'ufficio assistenza. Un membro dello staff sarà qui a breve.\n\nMotivo: **{reason}**',
            color: '#5865F2'
        }
    },
    verify: {
        panel: {
            title: '🛡️ Protocollo di Identificazione',
            description: 'Per accedere alla città, devi confermare la tua identità cittadina. Clicca il pulsante qui sotto per procedere.',
            color: '#3BA4FF'
        },
        success: {
            title: '✅ Identità Confermata',
            description: 'Ottime notizie cittadino! La tua registrazione presso **{guild}** è andata a buon fine.',
            color: '#2ecc71'
        }
    },
    fivem: {
        status_embed: {
            title: '🏙️ Stato della Città',
            description: 'Informazioni in tempo reale sul server FiveM.\n\n📡 **Server:** {serverName}\n👥 **Cittadini:** {players}/{maxPlayers}\n🟢 **Status:** Operativo',
            color: '#2ecc71'
        },
        offline_embed: {
            title: '🔴 Città Inaccessibile',
            description: 'Al momento il server FiveM non risponde. Potrebbe esserci un riavvio in corso.',
            color: '#e74c3c'
        }
    },
    welcome: {
        join: {
            title: '✈️ Nuovo Arrivo in Città',
            description: 'Benvenuto **{user}** in **{guild}**! Siamo felici di vederti qui. Assicurati di leggere il regolamento.',
            color: '#2ecc71'
        },
        leave: {
            title: '🚗 Un Cittadino ha Lasciato la Città',
            description: 'Spiace vedere **{user}** lasciare **{guild}**. Speriamo di rivederti presto.',
            color: '#e74c3c'
        }
    },
    economy: {
        balance: {
            title: '💰 Estratto Conto Bancario',
            description: 'Gentile **{user}**, ecco il riepilogo delle tue finanze:\n\n💵 **Contanti:** ${cash}\n🏦 **Banca:** ${bank}',
            color: '#2ecc71'
        },
        daily: {
            title: '🎁 Bonus Fedeltà',
            description: 'Hai ritirato il tuo bonus giornaliero di **${amount}**. Torna domani per il prossimo accredito!',
            color: '#f1c40f'
        }
    },
    photocontest: {
        panel: {
            title: '🖼️ Galleria d\'Arte: Esposizione Fotografica',
            description: 'La città è alla ricerca di scorci unici. Cattura un momento memorabile e depositalo in questa galleria per partecipare al concorso cittadino.',
            color: '#F39C12',
            footer: 'Dipartimento Cultura | Verix RP'
        }
    }
};
