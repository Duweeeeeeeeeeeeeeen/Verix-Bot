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
        },
        setup_success: {
            title: '✅ Sistema Inizializzato',
            description: 'Il modulo è stato configurato correttamente e i protocolli sono ora operativi.',
            color: '#2ecc71'
        },
        module_list: {
            title: '⚙️ Organigramma Moduli',
            description: 'Elenco dei protocolli operativi caricati nel sistema.\n\n{list}',
            color: '#5865f2'
        },
        module_enabled: {
            title: '✅ Protocollo Attivato',
            description: 'Il modulo **{module}** è stato caricato con successo e i suoi protocolli sono ora operativi.',
            color: '#2ecc71'
        },
        module_disabled_success: {
            title: '❌ Protocollo Disattivato',
            description: 'Il modulo **{module}** è stato scaricato dal sistema. Tutte le funzioni correlate sono sospese.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ Stato Invariato',
            description: 'Il modulo **{module}** si trova già nello stato richiesto dai protocolli.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Soggetto Ignoto',
            description: 'Il modulo **{module}** non risulta censito nei nostri database ministeriali.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Pulizia Completata',
            description: 'Ho eliminato **{amount}** messaggi come richiesto dai protocolli.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ Nessun Reperto Trovato',
            description: 'Non ho trovato messaggi che corrispondano ai criteri di eliminazione specificati.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Errore di Bonifica',
            description: 'Si è verificato un errore durante l\'eliminazione dei messaggi. Nota: non posso eliminare messaggi più vecchi di 14 giorni.',
            color: '#e74c3c'
        },
        ping: {
            title: '🏓 Protocollo di Latenza',
            description: '>>> **Stato della Rete:**\n• Latenza Bot: `{latency}ms`\n• Latenza API: `{api_latency}ms`',
            color: '#3498db'
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
            title: '📄 Pratica d\'Ingresso: {user_name}',
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
            description: 'Hai risposto a tutte le domande del colloquio. Lo staff analizzerà la tua candidatura a breve.\n\nControlla le tue risposte qui sopra e usa i pulsanti per confermare o annullare l\'invio.',
            color: '#3498db'
        },
        min_length_error: {
            title: '⚠️ Dettagli Insufficienti',
            description: 'La tua risposta deve contenere almeno **{minLength}** caratteri per essere considerata valida. Prova a spiegarti un po\' meglio.',
            color: '#f1c40f'
        },
        dm_accepted: {
            title: '✅ Idoneità Confermata',
            description: 'Congratulazioni cittadino! La tua candidatura presso **{guild}** è stata approvata dalla Commissione.\n\nOra puoi accedere ai canali ufficiali e iniziare la tua esperienza.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Esito Negativo',
            description: 'Spiacente, ma la valutazione del tuo dossier presso **{guild}** non ha dato esito positivo.\n\n**MOTIVAZIONE:**\n{reason}\n\nPotrai riprovare a presentare una nuova istanza dopo il periodo di cooldown.',
            color: '#e74c3c'
        },
        dm_voice_rejected: {
            title: '⚠️ Protocollo Orale Respinto',
            description: 'Non hai superato la valutazione orale presso **{guild}**. Ti invitiamo a ripassare i protocolli cittadini prima di ripresentarti.',
            color: '#e74c3c'
        },
        dm_text_pass: {
            title: '📝 Scritto Superato',
            description: 'Hai superato la prova scritta su **{guild}**! Ora puoi recarti nel canale vocale d\'attesa per il colloquio finale.',
            color: '#f1c40f'
        },
        staff_received: {
            title: '📩 Nuova Pratica Whitelist',
            description: 'L\'utente **{user_name}** ha sottomesso il proprio dossier per la valutazione.\n\n**INFO:**\n• Discord: <@{user_id}>\n• ID Pratica: `{app_id}`',
            color: '#3498db'
        },
        dm_submitted: {
            title: '📋 Dossier Ricevuto',
            description: 'La tua candidatura per entrare in **{guild}** è stata acquisita dai nostri sistemi.\n\nUn membro della Commissione la revisionerà il prima possibile. Verrai avvisato qui non appena ci sarà un esito.',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Dossier Sottomesso',
            description: 'La tua documentazione è stata inviata correttamente agli uffici competenti. Verrai avvisato a breve dell\'esito.',
            color: '#2ecc71'
        }
    },
    background: {
        panel: {
            title: '📜 Archivio Storico: Deposito Background',
            description: 'Inizia la stesura della storia del tuo personaggio per ottenere l\'approvazione definitiva del background.\n\nClicca il pulsante qui sotto per avviare il protocollo di deposito.',
            color: '#5865f2',
            footer: 'Ufficio Anagrafe | Verix RP'
        },
        instructions: {
            title: '✍️ Redazione Background',
            description: 'Stai iniziando la stesura del tuo background. Assicurati di descrivere accuratamente le origini e le ambizioni del tuo personaggio.\n\n**REQUISITI:**\n• Coerenza con il setting della città.\n• Rispetto delle linee guida narrative.',
            color: '#3498db'
        },
        dm_accepted: {
            title: '📜 Background Approvato',
            description: 'Il tuo background è stato ufficialmente depositato negli archivi di **{guild}**. La tua storia è ora parte integrante della città.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '⚠️ Revisione Testuale Richiesta',
            description: 'La tua proposta di background per **{guild}** è stata respinta o richiede revisioni.\n\n**NOTE DELLO STAFF:**\n{reason}',
            color: '#e74c3c'
        },
        staff_received: {
            title: '📑 Nuovo Background Ricevuto',
            description: 'L\'utente **<@{userId}>** ha inviato il proprio background per la revisione.\n\n**INFO:**\n• Link: {bg_link}\n• Desc: {bg_desc}\n• Allegato: {bg_attachment}',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Dossier Sottomesso',
            description: 'La tua documentazione è stata inviata correttamente agli uffici competenti. Verrai avvisato a breve dell\'esito.',
            color: '#2ecc71'
        },
        session_cancelled: {
            title: '⚠️ Procedura Interrotta',
            description: 'Il deposito del background è stato annullato. Il canale verrà rimosso tra **{time}**.',
            color: '#e74c3c'
        },
        dm_received: {
            title: '✅ Dossier Background Ricevuto',
            description: 'Il tuo dossier per **{guild}** è stato correttamente archiviato nei nostri sistemi. Un ufficiale della commissione lo revisionerà a breve.',
            color: '#2ecc71'
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
            title: '📂 Pratica Assistenziale: {type}',
            description: 'Benvenuto allo sportello, <@{user_id}>. Un operatore prenderà in carico la tua richiesta a breve.\n\n**DETTAGLI:**\n• Priorità: `{priority}`\n• Stato: `{status}`',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Creato',
            description: 'Il tuo ufficio assistenza è stato aperto correttamente.\n\n**CANALE:** {channel}',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Archivio: Pratica Conclusa',
            description: 'La documentazione di questo ufficio è stata depositata correttamente negli archivi.',
            color: '#E74C3C'
        },
        already_exists: {
            title: '⚠️ Protocollo Pendente',
            description: 'Risulta già una pratica di tipo **{type}** aperta a tuo nome nel canale <#{channelId}>.',
            color: '#f1c40f'
        },
        already_claimed: {
            title: '🙋‍♂️ Segnalazione Presa in Carico',
            description: 'Questa pratica è già sotto la supervisione dell\'operatore **<@{assignedStaffId}>**.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Presa in Carico',
            description: 'L\'operatore **{staff}** ha preso in gestione questa pratica e ti assisterà a breve.',
            color: '#3498db'
        },
        status_updated: {
            title: '🔄 Protocollo Aggiornato',
            description: 'Lo stato della pratica è stato impostato ufficialmente su: **{status}**.',
            color: '#3498db'
        },
        staff_ticket_log: {
            title: '📁 Archivio Ticket',
            description: 'Un ticket è stato chiuso e archiviato.\n\n**INFO:**\n• Utente: {user}\n• Tipo: `{type}`\n• Staff: {staff}',
            color: '#ff4757'
        },
        close_status: {
            title: '🛡️ Chiusura in Corso',
            description: 'I protocolli di archiviazione sono stati avviati. Il canale verrà rimosso o spostato a breve.',
            color: '#f1c40f'
        },
        cannot_close: {
            title: '⚠️ Chiusura Negata',
            description: 'Non è stato possibile archiviare la pratica. Assicurati che tutti i protocolli operativi siano stati conclusi.',
            color: '#e74c3c'
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
        },
        success_reply: {
            title: '✅ Registrazione Completata',
            description: 'Benvenuto ufficialmente tra noi, {user}! Tutti i permessi sono stati attivati.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Protocollo Già Eseguito',
            description: 'La tua identità risulta già confermata nei nostri database di **{guild}**.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Benvenuto nel Server',
            description: 'Ti sei verificato correttamente su **{guild}**. Ora hai accesso completo alle funzionalità del server!',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Registro Entrate: Nuovo Cittadino',
            description: 'Un nuovo utente ha completato la verifica.\n\n**IDENTITÀ:** {user}\n**ID:** `{userId}`\n**STATUS:** {role}',
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
            description: 'Gentile **{user}**, ecco il riepilogo delle tue finanze:\n\n💵 **Contanti:** `${cash}`\n🏦 **Banca:** `${bank}`',
            color: '#2ecc71'
        },
        daily: {
            title: '🎁 Bonus Fedeltà',
            description: 'Hai ritirato il tuo bonus giornaliero di **${amount}**. Torna domani per il prossimo accredito!',
            color: '#f1c40f'
        },
        cooldown: {
            title: '⏳ Protocollo d\'Attesa',
            description: 'Hai già riscattato il tuo premio per oggi. I protocolli bancari richiedono un attesa di **{time}** prima del prossimo accredito.',
            color: '#f1c40f'
        },
        user_not_found: {
            title: '❌ Soggetto Non Censito',
            description: 'L\'utente specificato non risulta registrato nei nostri database economici.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ Errore Transazione',
            description: 'Si è verificato un errore durante l\'operazione bancaria. Riprova più tardi.',
            color: '#e74c3c'
        }
    },
    photocontest: {
        panel: {
            title: '🖼️ Galleria d\'Arte: Esposizione Fotografica',
            description: 'La città è alla ricerca di scorci unici. Cattura un momento memorabile e depositalo in questa galleria per partecipare al concorso cittadino.',
            color: '#F39C12',
            footer: 'Dipartimento Cultura | Verix RP'
        },
        submission: {
            title: '🎨 Nuova Opera Esposta',
            description: '>>> **Dettagli Esposizione:**\n• Autore: {username}\n• Tema: `{theme}`\n• Scadenza: {endTime}',
            color: '#3498db'
        },
        already_submitted: {
            title: '⚠️ Protocollo Partecipazione',
            description: 'Hai già depositato un\'opera per questo concorso. I regolamenti prevedono una sola partecipazione per cittadino.',
            color: '#f1c40f'
        },
        vote_up: {
            title: '👍 Voto Registrato',
            description: 'Hai espresso il tuo apprezzamento per quest\'opera. Il tuo voto è stato aggiunto al conteggio ufficiale.',
            color: '#2ecc71'
        },
        vote_down: {
            title: '👎 Voto Registrato',
            description: 'Hai registrato il tuo dissenso per quest\'opera. Il punteggio è stato aggiornato secondo i protocolli.',
            color: '#e74c3c'
        },
        vote_removed: {
            title: '🔄 Voto Ritirato',
            description: 'Hai rimosso la tua preferenza da quest\'opera. Il conteggio è stato aggiornato.',
            color: '#f1c40f'
        },
        interaction_notify: {
            title: '📸 Nuova Interazione!',
            description: 'Qualcuno ha appena apprezzato la tua opera nel contest! La tua popolarità in città sta crescendo.',
            color: '#00FF7F'
        },
        entry_not_found: {
            title: '❌ Opera Non Trovata',
            description: 'Spiacente, ma questa fotografia sembra essere stata rimossa dall\'esposizione durante il processo di votazione.',
            color: '#e74c3c'
        },
        self_vote_error: {
            title: '⚖️ Conflitto d\'Interesse',
            description: 'I regolamenti cittadini impediscono di votare la propria opera d\'arte. Lascia che siano gli altri a giudicare il tuo talento!',
            color: '#f1c40f'
        },
        themesList: ['Natura', 'Architettura', 'Tramonti', 'Cibo', 'Minimalismo', 'Cyberpunk', 'Ritratti', 'Animali']
    },
    twitch: {
        stream_online: {
            title: '🎥 Canale in Live: {streamer}',
            description: 'Sintonizzati ora! **{streamer}** ha appena iniziato una trasmissione.\n\n📺 **Titolo:** {title}\n🎮 **Categoria:** {game}',
            color: '#a970ff'
        }
    },
    voice: {
        voice_waiting: {
            title: '⏳ Sala d\'Attesa: Colloquio Orale',
            description: 'Il tuo dossier scritto è stato approvato! Ti trovi ora nella lista d\'attesa per il colloquio orale.\n\nUn esaminatore ti contatterà non appena sarà disponibile. Resta sintonizzato.',
            color: '#f1c40f'
        },
        voice_guide: {
            title: '🎙️ Guida Colloquio Orale',
            description: 'Stai per esaminare l\'utente **<@{userId}>**.\n\n**PROCEDURA:**\n1. Sposta l\'utente in un canale vocale.\n2. Verifica la qualità del microfono.\n3. Procedi con le domande di rito.\n4. Usa i pulsanti qui sotto per registrare l\'esito finale.',
            color: '#3498db'
        },
        voice_staff_log: {
            title: '🎙️ Log Attività Vocale',
            description: 'L\'utente **{user}** ha iniziato o terminato una sessione vocale con lo staff.',
            color: '#5865F2'
        },
        voice_error_flow: {
            title: '⚠️ Errore Protocollo Vocale',
            description: 'Si è verificato un errore durante la gestione della coda vocale. Riprova tra qualche istante.',
            color: '#e74c3c'
        },
        dm_accepted: {
            title: '✅ Idoneità Confermata',
            description: 'Congratulazioni cittadino! Hai superato con successo il colloquio orale presso **{guild}**.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Esito Negativo',
            description: 'Spiacente, ma la valutazione del tuo colloquio presso **{guild}** non è stata favorevole.\n\n**MOTIVAZIONE:**\n{reason}\n\nPotrai riprovare tra **{cooldown}**.',
            color: '#e74c3c'
        },
        staff_approved: {
            title: '📝 Log Valutazione: APPROVATO',
            description: 'L\'utente **<@{userId}>** è stato dichiarato idoneo da **{staff}**.',
            color: '#2ecc71'
        },
        staff_denied: {
            title: '📝 Log Valutazione: RESPINTO',
            description: 'L\'utente **<@{userId}>** è stato respinto da **{staff}**.\n\n**Motivo:** {reason}',
            color: '#e74c3c'
        }
    },
    antispam: {
        enabled: false,
        maxMessages: 5,
        timeWindow: 5000,
        deleteSpam: true,
        warnUser: true,
        warnMessage: '⚠️ {user}, per favore non spammare! Hai inviato troppi messaggi in poco tempo.',
        ignoredRoles: [],
        ignoredChannels: []
    },
    moderation: {
        warn: {
            title: '⚠️ Richiamo Ufficiale',
            description: '{user}, i tuoi comportamenti hanno violato i protocolli cittadini.\n\n**MOTIVO:** {reason}',
            color: '#f1c40f'
        },
        timeout: {
            title: '🔇 Restrizione Comunicazioni',
            description: '{user}, sei stato messo in isolamento per **{duration} minuti**.\n\n**MOTIVO:** {reason}',
            color: '#e67e22'
        },
        kick: {
            title: '👢 Espulsione Coatta',
            description: '{user} è stato rimosso dalla città per gravi violazioni dei protocolli.\n\n**MOTIVO:** {reason}',
            color: '#e74c3c'
        },
        ban: {
            title: '🚫 Esilio Definitivo',
            description: '{user} è stato bandito permanentemente dalla città.\n\n**MOTIVO:** {reason}',
            color: '#000000'
        },
        command_ban: {
            title: '🔨 Membro Bannato',
            description: '**Utente:** {user}\n**Moderatore:** {mod}\n**Motivo:** {reason}',
            color: '#FF0000'
        },
        command_kick: {
            title: '👢 Membro Espulso',
            description: '**Utente:** {user}\n**Moderatore:** {mod}\n**Motivo:** {reason}',
            color: '#e74c3c'
        }
    }
};
