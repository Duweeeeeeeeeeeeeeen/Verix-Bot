/**
 * Default Professional Messages for all modules (Italian).
 * These are used as standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Accesso Negato',
            description: 'Non disponi delle autorizzazioni necessarie per eseguire questa operazione. Contatta un amministratore se ritieni si tratti di un errore.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Modulo Disattivato',
            description: 'Il modulo **{module}** è attualmente disattivato in questo server. Contatta lo staff per maggiori informazioni.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Gerarchia Ruoli',
            description: 'Impossibile assegnare il ruolo **{role}**. Il bot non può gestire ruoli superiori o uguali al proprio nella gerarchia del server.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ Errore di Sistema',
            description: 'Si è verificato un errore imprevisto durante l\'elaborazione. I tecnici sono stati informati.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ Configurazione Completata',
            description: 'Il modulo è stato configurato correttamente ed è ora operativo.',
            color: '#2ecc71'
        },
        module_list: {
            title: '⚙️ Gestione Moduli',
            description: 'Elenco dei moduli attualmente caricati nel sistema:\n\n{list}',
            color: '#5865f2'
        },
        module_enabled: {
            title: '✅ Modulo Attivato',
            description: 'Il modulo **{module}** è stato attivato con successo.',
            color: '#2ecc71'
        },
        module_disabled_success: {
            title: '❌ Modulo Disattivato',
            description: 'Il modulo **{module}** è stato rimosso dal sistema. Tutte le funzioni correlate sono sospese.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ Stato Invariato',
            description: 'Il modulo **{module}** si trova già nello stato richiesto.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Modulo Non Trovato',
            description: 'Il modulo **{module}** non risulta registrato nel sistema.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Pulizia Chat',
            description: 'Sono stati eliminati **{amount}** messaggi con successo.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ Nessun Messaggio',
            description: 'Non sono stati trovati messaggi che corrispondano ai criteri di eliminazione.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Errore Pulizia',
            description: 'Si è verificato un errore durante l\'eliminazione. Nota: i messaggi più vecchi di 14 giorni non possono essere eliminati in massa.',
            color: '#e74c3c'
        },
        ping: {
            title: '🏓 Stato Connessione',
            description: '>>> **Latenza:**\n• Bot: `{latency}ms`\n• API: `{api_latency}ms`',
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
        }
    },
    tickets: {
        panel: {
            title: '🎫 Centro Supporto',
            description: 'Hai bisogno di assistenza o desideri segnalare un problema? Apri un ticket selezionando la categoria corretta dal menu sottostante.',
            color: '#2ECC71',
            footer: 'Support Team | {guild}'
        },
        ticket: {
            title: '📂 Ticket di Supporto: {type}',
            description: 'Benvenuto, <@{user_id}>. Un membro dello staff prenderà in carico la tua richiesta a breve.\n\n**DETTAGLI:**\n• Priorità: `{priority}`\n• Stato: `{status}`',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Creato',
            description: 'Il tuo ticket è stato aperto con successo.\n\n**Canale:** {channel}',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Ticket Chiuso',
            description: 'Questo ticket è stato chiuso e archiviato correttamente.',
            color: '#E74C3C'
        },
        already_exists: {
            title: '⚠️ Ticket Esistente',
            description: 'Hai già un ticket di tipo **{type}** aperto nel canale <#{channelId}>.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Presa in Carico',
            description: 'Lo staffer **{staff}** ha preso in gestione il tuo ticket e ti assisterà a breve.',
            color: '#3498db'
        },
        status_updated: {
            title: '🔄 Stato Aggiornato',
            description: 'Lo stato del ticket è stato impostato su: **{status}**.',
            color: '#3498db'
        },
        inactivity_close: {
            title: '⚠️ Chiusura per Inattività',
            description: 'Questo ticket è stato chiuso automaticamente per mancanza di attività recente.',
            color: '#e74c3c'
        },
        default_welcome: {
            title: '🎫 Richiesta di Assistenza',
            description: 'Benvenuto nel centro supporto. Uno staffer sarà qui a breve.\n\nMotivo: **{reason}**',
            color: '#5865F2'
        }
    },
    verify: {
        panel: {
            title: '🛡️ Verifica Account',
            description: 'Per accedere ai canali del server, devi verificare la tua identità. Clicca il pulsante qui sotto per procedere.',
            color: '#3BA4FF',
            footer: 'Security System | {guild}'
        },
        success: {
            title: '✅ Verifica Completata',
            description: 'Benvenuto! La tua verifica su **{guild}** è andata a buon fine. Ora hai accesso a tutti i canali.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Già Verificato',
            description: 'La tua identità risulta già verificata nel database di **{guild}**.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Benvenuto nel Server',
            description: 'Ti sei verificato correttamente su **{guild}**. Esplora i nostri canali e divertiti!',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Log Verifica: Nuovo Membro',
            description: 'Un nuovo utente ha completato la verifica.\n\n**Utente:** {user}\n**ID:** `{userId}`',
            color: '#2ecc71'
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
            title: '👋 Benvenuto nel Server!',
            description: 'Ciao **{user}**, benvenuto su **{guild}**! Siamo felici di averti tra noi.\n\nAssicurati di leggere il regolamento per una convivenza serena.',
            color: '#2ecc71'
        },
        leave: {
            title: '👋 Arrivederci!',
            description: '**{user}** ha lasciato il server. Speriamo di rivederlo presto!',
            color: '#e74c3c'
        }
    },
    moderation: {
        warn: {
            title: '🛡️ Avvertimento Ufficiale',
            description: 'Attenzione **{user}**, hai ricevuto un avvertimento per violazione delle regole.\n\n**Motivo:**\n>>> {reason}',
            color: '#f1c40f',
            footer: 'Moderazione | {guild}'
        },
        timeout: {
            title: '🔇 Timeout Temporaneo',
            description: 'L\'utente **{user}** è stato mutato temporaneamente per **{duration}**.\n\n**Motivo:**\n>>> {reason}',
            color: '#e67e22'
        },
        kick: {
            title: '👢 Espulsione dal Server',
            description: 'Sei stato espulso dal server per violazione del regolamento.\n\n**Motivo:**\n>>> {reason}',
            color: '#e74c3c'
        },
        ban: {
            title: '🚫 Ban Permanente',
            description: 'Il tuo accesso a questo server è stato revocato permanentemente.\n\n**Motivo:**\n>>> {reason}',
            color: '#000000'
        }
    },
    giveaway: {
        no_participants: {
            title: '😔 Giveaway Concluso',
            description: 'Il giveaway per **{prize}** è terminato senza partecipanti validi.',
            color: '#e74c3c'
        },
        winners: {
            title: '🎉 Vincitori Giveaway!',
            description: 'Il giveaway per **{prize}** si è concluso!\n\n🏆 **Vincitori:** {winners}',
            color: '#2ecc71'
        },
        already_ended: {
            title: '⚠️ Giveaway Terminato',
            description: 'Spiacente, questo giveaway si è già concluso.',
            color: '#f1c40f'
        }
    },
    photocontest: {
        panel: {
            title: '📸 Photo Contest',
            description: 'Partecipa al nostro concorso fotografico! Carica la tua foto migliore seguendo il tema attuale.\n\n**Tema:** `{theme}`\n**Scadenza:** {endTime}',
            color: '#F39C12'
        },
        submission: {
            title: '🎨 Opera di {username}',
            description: 'Una nuova foto è stata caricata per il contest.\n\n**Tema:** `{theme}`\n**Scadenza:** {endTime}',
            color: '#3498db'
        }
    }
};
