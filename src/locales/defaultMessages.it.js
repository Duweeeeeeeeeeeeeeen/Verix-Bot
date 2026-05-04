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
        },
        voice_procedural_error: {
            title: '❌ Errore Procedurale',
            description: 'Spiacente cittadino, ma lo Stato non prevede colloqui orali per il tipo di visto da te richiesto.',
            color: '#e74c3c'
        },
        queue_log: {
            title: '📢 Protocollo Coda: Nuovo Ingresso',
            description: 'Un nuovo cittadino è in attesa per il colloquio.\n\n**SOGGETTO:** {user}\n**ID:** `{user_id}`\n**CODA ATTUALE:** `{waiting_count}`',
            color: '#3498db'
        },
        promote_vip_success: {
            title: '💎 Priorità VIP',
            description: 'L\'utente **{user}** è stato spostato in testa alla coda ministeriale.',
            color: '#2ecc71'
        },
        pause_success: {
            title: '⏸️ Sistema in Pausa',
            description: 'I protocolli di accesso vocale sono stati sospesi. Nessun nuovo cittadino potrà unirsi alla coda.',
            color: '#f1c40f'
        },
        resume_success: {
            title: '▶️ Sistema Riattivato',
            description: 'I protocolli di accesso vocale sono stati ripristinati. Gli uffici sono nuovamente operativi.',
            color: '#2ecc71'
        },
        skip_success: {
            title: '⏭️ Sessione Saltata',
            description: 'La sessione corrente è stata archiviata forzatamente. Il prossimo cittadino in coda verrà invitato.',
            color: '#3498db'
        },
        skip_error_no_session: {
            title: '❌ Nessuna Sessione',
            description: 'Non risultano sessioni attive da poter saltare al momento.',
            color: '#e74c3c'
        },
        app_not_found: {
            title: '❌ Candidatura Non Trovata',
            description: 'Il dossier richiesto non risulta presente nei nostri archivi digitali.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ Configurazione Whitelist',
            description: 'Il sistema di accesso cittadino è stato configurato e il pannello è stato inviato nel canale indicato.',
            color: '#2ecc71'
        },
        edit_menu: {
            title: '✏️ Correzione Candidatura',
            description: 'Seleziona dal menu sottostante la domanda che desideri correggere.',
            color: '#3498db'
        },
        edit_success: {
            title: '✅ Risposta Aggiornata',
            description: 'La tua risposta alla domanda **{index}** è stata salvata correttamente.\n\nIl riepilogo nel canale è stato aggiornato. Desideri modificare altro?',
            color: '#2ecc71'
        },
        edit_closed: {
            title: '✅ Correzione Terminata',
            description: 'Il menu di modifica è stato chiuso. Ora puoi procedere con la sottomissione finale.',
            color: '#2ecc71'
        },
        voice_setup_success: {
            title: '🎙️ Configurazione Vocale Aggiornata',
            description: 'I protocolli per l\'accesso vocale sono stati aggiornati con successo.\n\n**DETTAGLI:**\n• Modalità: `{mode}`\n• Limite Contemporanei: `{limit}`\n• Ruolo VIP: `{vip_role}`\n• Pings Staff: `{ping_staff}`',
            color: '#2ecc71'
        },
        questions_list: {
            title: '📋 Registro Domande Whitelist',
            description: 'Ecco l\'elenco attuale dei quesiti ministeriali:\n\n{questions}',
            color: '#3498db'
        },
        question_added: {
            title: '✅ Domanda Aggiunta',
            description: 'Il nuovo quesito è stato inserito correttamente nel protocollo.\n\n**DOMANDA:** {text}\n**MINIMO CARATTERI:** {min_length}',
            color: '#2ecc71'
        },
        question_removed: {
            title: '🗑️ Domanda Rimossa',
            description: 'Il quesito selezionato è stato rimosso dal registro ufficiale.\n\n**DOMANDA:** {text}',
            color: '#e74c3c'
        },
        dashboard_init_success: {
            title: '💻 Dashboard Whitelist Inizializzata',
            description: 'L\'interfaccia web per la gestione dei cittadini è stata configurata correttamente.',
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
        },
        cooldown: {
            title: '⚠️ Protocollo Cooldown',
            description: 'Hai inviato un background troppo recentemente. Potrai sottomettere una nuova versione {time_left}.\n\nUsa questo tempo per perfezionare la tua storia.',
            color: '#f1c40f'
        },
        upload_success: {
            title: '✅ Allegato Registrato',
            description: 'Il file è stato acquisito correttamente dai sistemi.\n\n**DOCUMENTO:** [{filename}]({url})',
            color: '#2ecc71'
        },
        error: {
            title: '❌ Errore Background',
            description: 'Non è stato possibile elaborare la tua richiesta. {reason}',
            color: '#e74c3c'
        },
        channel_created: {
            title: '✅ Sessione Avviata',
            description: 'Il tuo canale per il deposito del background è pronto: {channel}',
            color: '#2ecc71'
        },
        active_session: {
            title: '⚠️ Protocollo Attivo',
            description: 'Hai già una richiesta di background attiva o in fase di revisione.',
            color: '#f1c40f'
        },
        setup_success: {
            title: '📜 Sistema Background Configurato',
            description: 'I protocolli di deposito background sono ora attivi.\n\n**PANNELLO:** {channel}',
            color: '#2ecc71'
        },
        review_success: {
            title: '📝 Revisione Completata',
            description: 'Hai elaborato la richiesta di background per l\'utente **<@{userId}>**.\n\n**ESITO:** {status}',
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
        },
        inactivity_close: {
            title: '⚠️ Protocollo Inattività',
            description: 'Questo ufficio è stato chiuso automaticamente dai sistemi per mancanza di comunicazioni recenti.',
            color: '#e74c3c'
        },
        claim_success: {
            title: '✅ Ticket Preso in Carico',
            description: 'Hai assunto correttamente la supervisione di questa pratica.',
            color: '#2ecc71'
        },
        close_success: {
            title: '🔒 Ticket Archiviato',
            description: 'La pratica è stata chiusa e i registri sono stati salvati.',
            color: '#2ecc71'
        },
        priority_select: {
            title: '🎫 Priorità Richiesta',
            description: 'Seleziona il livello di urgenza per la tua pratica di tipo **{type}**.',
            color: '#3498db'
        },
        quick_reply_menu: {
            title: '📝 Risposte Rapide',
            description: 'Seleziona un template predefinito da inviare all\'utente.',
            color: '#3498db'
        },
        tag_menu: {
            title: '🏷️ Gestione Tag',
            description: 'Scegli un protocollo o un tag da assegnare a questa pratica.',
            color: '#3498db'
        },
        close_error_logs: {
            title: '❌ Errore Archiviazione',
            description: 'Il bot non dispone dei permessi necessari nel canale LOGS ({channel}).\n\n**Mancanti:** {missing}',
            color: '#e74c3c'
        },
        close_error_category: {
            title: '❌ Configurazione Mancante',
            description: 'La categoria per i ticket chiusi non è stata configurata correttamente nella dashboard.',
            color: '#e74c3c'
        },
        error: {
            title: '❌ Errore Ticket',
            description: 'Non è stato possibile completare l\'operazione richiesta. Riprova o contatta un amministratore.',
            color: '#e74c3c'
        },
        user_managed: {
            title: '👥 Gestione Utente',
            description: 'L\'utente **{user}** è stato **{action}** dal ticket.',
            color: '#3498db'
        },
        setup_success: {
            title: '🎫 Pannello Assistenza Configurato',
            description: 'Il portale sportello al cittadino è stato inviato con successo.\n\n**CANALE:** {channel}',
            color: '#2ecc71'
        },
        stats_display: {
            title: '📊 Statistiche Assistenza',
            description: 'Riepilogo attività per il server/operatore:\n\n{stats}',
            color: '#3498db'
        },
        typesConfig: {
            supporto: { label: 'Supporto Generale', emoji: '🎫', color: '#6366f1', staffRoleIds: [] },
            segnalazione: { label: 'Segnalazione Utente', emoji: '🚨', color: '#ef4444', staffRoleIds: [] },
            donazione: { label: 'Donazioni', emoji: '💰', color: '#f59e0b', staffRoleIds: [] },
            bug: { label: 'Segnalazione Bug', emoji: '🐛', color: '#10b981', staffRoleIds: [] }
        },
        config_not_found: {
            title: '❌ Configurazione Mancante',
            description: 'I protocolli di assistenza non sono stati inizializzati correttamente per questo server. Contatta un amministratore.',
            color: '#e74c3c'
        },
        category_not_available: {
            title: '❌ Settore Inaccessibile',
            description: 'La categoria di assistenza richiesta non è attualmente disponibile o è stata rimossa dai registri.',
            color: '#e74c3c'
        },
        staff_only: {
            title: '⚠️ Accesso Negato',
            description: 'Solo gli ufficiali dello staff autorizzati possono utilizzare questi strumenti amministrativi.',
            color: '#f1c40f'
        },
        claim_success: {
            title: '✅ Presa in Carico',
            description: 'Hai assunto correttamente la supervisione di questa pratica. Il cittadino è stato informato.',
            color: '#2ecc71'
        },
        claim_already: {
            title: '⚠️ Pratica Già Assegnata',
            description: 'Questa pratica è già sotto la supervisione dell\'operatore <@{staffId}>.',
            color: '#f1c40f'
        },
        status_update_success: {
            title: '🔄 Stato Aggiornato',
            description: 'Lo stato della pratica è stato impostato correttamente su: **{status}**.',
            color: '#3498db'
        },
        note_success: {
            title: '📌 Nota Archiviata',
            description: 'La tua nota interna è stata aggiunta correttamente al dossier della pratica.',
            color: '#2ecc71'
        },
        close_started: {
            title: '🛡️ Archiviazione Avviata',
            description: 'I protocolli di chiusura sono stati attivati. La pratica verrà rimossa o spostata a breve.',
            color: '#f1c40f'
        },
        blacklist_error: {
            title: '🚫 Accesso Interdetto',
            description: 'Ti è stato revocato il permesso di utilizzare i servizi di assistenza per violazione dei protocolli.',
            color: '#000000'
        },
        created_success: {
            title: '✅ Pratica Aperta',
            description: 'La tua richiesta è stata protocollata. Recati allo sportello <#{channelId}> per procedere.',
            color: '#2ecc71'
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
        },
        error: {
            title: '❌ Errore Identificazione',
            description: 'Si è verificato un problema tecnico durante la conferma della tua identità. Per favore, contatta un ufficiale del Ministero o riprova più tardi.',
            color: '#e74c3c'
        }
    },
    fivem: {
        status_embed: {
            title: '🏙️ Stato della Città: Online',
            description: 'Il cuore pulsante della metropoli è attivo. I cittadini sono invitati a connettersi per iniziare la loro giornata.\n\n📡 **Server:** `{serverName}`\n👥 **Cittadini in Città:** `{players}/{maxPlayers}`\n🟢 **Stato Protocolli:** Operativo',
            color: '#2ecc71',
            footer: 'Monitoraggio Urbano | Verix RP'
        },
        offline_embed: {
            title: '🔴 Stato della Città: Offline',
            description: 'Attenzione cittadini. Il collegamento con la metropoli è stato interrotto. I tecnici stanno lavorando per ripristinare i protocolli di accesso.\n\n⚠️ **Stato:** Inaccessibile / Manutenzione',
            color: '#e74c3c',
            footer: 'Emergenza Urbana | Verix RP'
        }
    },
    welcome: {
        join: {
            title: '✈️ Benvenuto in Città',
            description: 'Un nuovo cittadino, **{user}**, è appena atterrato! Ti auguriamo una permanenza prospera.\n\nAssicurati di consultare i protocolli regolamentari per evitare sanzioni.',
            color: '#2ecc71'
        },
        leave: {
            title: '🚗 Partenza Cittadina',
            description: 'Il cittadino **{user}** ha lasciato la città. Speriamo di rivederlo presto nei nostri registri.',
            color: '#e74c3c'
        }
    },
    photocontest: {
        panel: {
            title: '🖼️ Galleria d\'Arte: Esposizione Fotografica',
            description: 'La città è alla ricerca di scorci unici. Cattura un momento memorabile e depositalo in questa galleria per partecipare al concorso cittadino.\n\n**Tema Attuale:** `{theme}`\n**Durata:** `{duration} ore`\n**Scadenza:** {endTime}',
            color: '#F39C12',
            footer: 'Dipartimento Cultura | Verix RP'
        },
        submission: {
            title: '🎨 Opera di {username}',
            description: 'Questa fotografia è stata sottomessa per il contest cittadino.\n\n**Tema:** `{theme}`\n**Punteggio:** `0 pt`\n**Scadenza:** {endTime}',
            color: '#3498db',
            footer: 'Galleria Cittadina'
        },
        submission_confirmed: {
            title: '🎨 Nuova Opera Esposta',
            description: 'Hai depositato correttamente la tua opera nella galleria cittadina. Ora gli altri cittadini potranno ammirarla e votarla.\n\n**Tema:** `{theme}`',
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
        interaction_notify: {
            title: '📸 Nuova Interazione!',
            description: 'Qualcuno ha appena apprezzato la tua opera nel contest! La tua popolarità in città sta crescendo.',
            color: '#00FF7F'
        },
        leaderboard_display: {
            title: '🏆 Hall of Fame: Grandi Fotografi',
            description: 'Ecco i cittadini che hanno immortalato i momenti più iconici della nostra città:\n\n{list}',
            color: '#FFD700'
        },
        contest_end_log: {
            title: '🏆 Proclamazione Vincitore',
            description: 'Il concorso fotografico si è concluso! Congratulazioni a **{user}** per aver vinto con l\'opera "{theme}".\n\n**VOTI RICEVUTI:** {votes}',
            color: '#F1C40F'
        },
        staff_log: {
            title: '🛡️ Alert Staff: Nuova Foto',
            description: 'L\'utente **{user}** ha caricato una nuova fotografia nel contest.\n\n**TEMA:** {theme}',
            color: '#3498db'
        },
        error_no_participants: {
            title: '😔 Contest Concluso',
            description: 'Il concorso fotografico è terminato, ma purtroppo non sono state depositate opere valide nei nostri archivi.',
            color: '#e74c3c'
        },
        no_contest_active: {
            title: '❌ Nessun Contest',
            description: 'Al momento non è in corso alcun concorso fotografico. Resta sintonizzato per il prossimo annuncio!',
            color: '#e74c3c'
        },
        no_submissions_leaderboard: {
            title: '📊 Classifica Vuota',
            description: 'Al momento non ci sono fotografie registrate nella classifica di questo contest.',
            color: '#3498db'
        },
        self_vote_error: {
            title: '⚖️ Conflitto d\'Interesse',
            description: 'I regolamenti cittadini impediscono di votare la propria opera d\'arte. Lascia che siano gli altri a giudicare il tuo talento!',
            color: '#f1c40f'
        },
        vote_success_up: {
            title: '👍 Voto Registrato',
            description: 'Hai espresso il tuo apprezzamento per questa fotografia. Il punteggio è stato aggiornato.',
            color: '#2ecc71'
        },
        vote_success_down: {
            title: '👎 Voto Registrato',
            description: 'Hai registrato il tuo dissenso per questa fotografia. Il punteggio è stato aggiornato.',
            color: '#e67e22'
        },
        already_voted_error: {
            title: '⚠️ Protocollo Voto',
            description: 'Hai già espresso il tuo verdetto per questa opera. I protocolli non permettono di cambiare o rimuovere il voto una volta registrato.',
            color: '#f1c40f'
        },
        submission_data_saved: {
            title: '✅ Dati Acquisiti',
            description: 'Informazioni salvate con successo! Ora invia la tua foto (come allegato) in questo canale entro 5 minuti per completare la procedura.',
            color: '#3498db'
        },
        leaderboard_error: {
            title: '❌ Errore Registro',
            description: 'Non è stato possibile recuperare i dati dei vincitori dai registri ministeriali.',
            color: '#e74c3c'
        },
        themesList: [
            { name: 'Natura' }, { name: 'Architettura' }, { name: 'Tramonti' }, 
            { name: 'Cibo' }, { name: 'Minimalismo' }, { name: 'Cyberpunk' }, 
            { name: 'Ritratti' }, { name: 'Animali' }
        ],
        duration: 24
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
        warn: {
            title: '🛡️ Protezione Anti-Spam',
            description: '{user}, i tuoi invii sono troppo rapidi. Rallenta il ritmo per evitare restrizioni permanenti.',
            color: '#f1c40f'
        },
        ignoredRoles: [],
        ignoredChannels: []
    },
    moderation: {
        warn: {
            title: '⚠️ Protocollo di Richiamo',
            description: 'Attenzione **{user}**, hai ricevuto un richiamo ufficiale per violazione dei codici civili.\n\n**MOTIVAZIONE:**\n>>> {reason}',
            color: '#f1c40f',
            footer: 'Ufficio Disciplinare | Verix RP'
        },
        timeout: {
            title: '🔇 Restrizione Comunicazioni',
            description: 'Il cittadino **{user}** è stato messo in isolamento temporaneo per **{duration}**.\n\n**MOTIVAZIONE:**\n>>> {reason}',
            color: '#e67e22'
        },
        dm_kick: {
            title: '👢 Espulsione Coatta',
            description: 'Sei stato allontanato dalla città per gravi mancanze verso i protocolli cittadini.\n\n**MOTIVAZIONE:**\n>>> {reason}',
            color: '#e74c3c'
        },
        dm_ban: {
            title: '🚫 Esilio Definitivo',
            description: 'Il tuo visto per risiedere in città è stato revocato permanentemente. L\'accesso ti è ora precluso.\n\n**MOTIVAZIONE:**\n>>> {reason}',
            color: '#000000'
        },
        command_ban: {
            title: '🔨 Protocollo Ban Eseguito',
            description: '**SOGGETTO:** {user}\n**UFFICIALE:** {mod}\n**MOTIVAZIONE:** {reason}',
            color: '#FF0000'
        },
        command_kick: {
            title: '👢 Protocollo Kick Eseguito',
            description: '**SOGGETTO:** {user}\n**UFFICIALE:** {mod}\n**MOTIVAZIONE:** {reason}',
            color: '#e74c3c'
        },
        error: {
            title: '❌ Errore Disciplinare',
            description: 'Impossibile eseguire l\'azione richiesta. Il soggetto potrebbe avere uno status superiore o il bot non dispone dei permessi necessari.',
            color: '#e74c3c'
        }
    },
    support: {
        paused: {
            title: '❌ Servizio Sospeso',
            description: 'I protocolli di assistenza vocale sono attualmente disattivati. Riprova più tardi.',
            color: '#e74c3c'
        },
        cooldown: {
            title: '⏳ Protocollo Cooldown',
            description: 'Hai già richiesto assistenza recentemente. Devi attendere prima di poter aprire un nuovo ufficio.',
            color: '#f1c40f'
        },
        queueFull: {
            title: '📡 Uffici Occupati',
            description: 'Tutti i canali di assistenza sono attualmente impegnati. Sei stato inserito nel sistema di attesa prioritario.',
            color: '#3498db'
        },
        sessionStart: {
            title: '✅ Operatore Disponibile',
            description: 'Un ufficio è stato liberato per te. Sei stato riallocato nel tuo canale di assistenza privato.',
            color: '#2ecc71'
        },
        staffLog: {
            title: '🎙️ Registro Assistenza',
            description: 'L\'utente **{user}** è entrato in assistenza.\n\n**Canale:** {voice_channel}',
            color: '#f1c40f'
        },
        queue_log: {
            title: '📢 Coda Assistenza: Nuovo Utente',
            description: '{vip_text}Un utente è in attesa di assistenza.\n\n**UTENTE:** {user}\n**ID:** `{user_id}`\n**POSIZIONE:** `{position}`',
            color: '#f1c40f'
        }
    },
    tempvoice: {
        enabled: false,
        channelNameTemplate: '🔊 Stanza di {user}',
        defaultUserLimit: 0,
        not_manageable: {
            title: '❌ Canale Ignoto',
            description: 'Questo canale non risulta censito come stanza temporanea gestibile dai nostri sistemi.',
            color: '#e74c3c'
        },
        not_owner: {
            title: '⚠️ Accesso Negato',
            description: 'Solo il creatore originario della stanza può utilizzare questi protocolli di gestione.',
            color: '#f1c40f'
        },
        lock_success: {
            title: '🔒 Canale Blindato',
            description: 'La stanza è stata chiusa. Nessun altro cittadino potrà connettersi senza autorizzazione.',
            color: '#e67e22'
        },
        unlock_success: {
            title: '🔓 Canale Aperto',
            description: 'Le restrizioni di accesso sono state rimosse. Chiunque può ora unirsi alla conversazione.',
            color: '#2ecc71'
        },
        limit_update: {
            title: '👥 Limite Aggiornato',
            description: 'La capacità massima della stanza è stata impostata a **{limit}** cittadini.',
            color: '#3498db'
        },
        rename_success: {
            title: '✅ Nome Modificato',
            description: 'Il protocollo di identificazione del canale è stato aggiornato in: **{name}**.',
            color: '#2ecc71'
        }
    },
    giveaway: {
        enabled: false,
        managerRoles: [],
        no_participants: {
            title: '😔 Giveaway Concluso',
            description: 'Il giveaway per **{prize}** è terminato, ma purtroppo non sono state depositate partecipazioni valide nei nostri archivi.',
            color: '#e74c3c'
        },
        winners: {
            title: '🎉 Congratulazioni Vincitori!',
            description: 'I protocolli hanno estratto i vincitori per: **{prize}**!\n\n🏆 **Vincitori:** {winners}',
            color: '#2ecc71'
        },
        already_ended: {
            title: '⚠️ Giveaway Concluso',
            description: 'Spiacente, ma questo giveaway è già terminato e non è più possibile partecipare.',
            color: '#f1c40f'
        }
    }
};
