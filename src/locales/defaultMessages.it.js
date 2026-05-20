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
            title: '📋 Sistema di Candidatura',
            description: 'Benvenuto nel portale di accesso. Per ottenere l\'accesso completo o richiedere un ruolo specifico, devi compilare la domanda di partecipazione.\n\nAssicurati di rispondere onestamente alle domande che ti verranno sottoposte.',
            color: '#3BA4FF',
            footer: 'Gestione Candidature | {guild}'
        },
        start: {
            title: '📄 Nuova Candidatura: {user_name}',
            description: 'Benvenuto. Per procedere con la tua richiesta, dobbiamo raccogliere alcune informazioni necessarie alla valutazione.\n\n**ISTRUZIONI:**\n• Rispondi onestamente e con dovizia di particolari.\n• Rispetta i tempi previsti per evitare l\'annullamento della sessione.',
            color: '#3BA4FF',
            footer: 'Ufficio Valutazioni | {guild}'
        },
        question: {
            title: '❓ Domanda: {current_index} di {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Revisione Finale',
            description: 'Rileggi attentamente le tue dichiarazioni. Una volta confermate, la tua domanda passerà alla revisione dello staff per il verdetto finale.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Configurazione Incompleta',
            description: 'La procedura di candidatura non è ancora stata configurata correttamente dallo staff. Per favore, riprova più tardi.',
            color: '#f1c40f'
        },
        already_exists: {
            title: '📄 Sessione in Corso',
            description: 'Risulta già una sessione di candidatura aperta o sottomessa a tuo nome. Concludi quella procedura prima di iniziarne una nuova.',
            color: '#3498db'
        },
        cooldown_error: {
            title: '⚠️ Tempo di Attesa',
            description: 'La tua ultima richiesta è stata respinta recentemente. Per motivi organizzativi, devi attendere **{time}** prima di poter presentare una nuova domanda.',
            color: '#e74c3c'
        },
        blacklist_error: {
            title: '🚫 Accesso Negato',
            description: 'Il tuo account è stato inserito nella blacklist del sistema whitelist. Non puoi procedere con la candidatura.',
            color: '#e74c3c'
        },
        test_passed: {
            title: '✅ Test Superato',
            description: 'Ottimo lavoro! Hai superato la fase scritta. Segui le istruzioni per procedere.',
            color: '#2ecc71'
        },
        test_failed: {
            title: '❌ Test Fallito',
            description: 'Spiacente, le tue risposte non hanno raggiunto lo standard richiesto.',
            color: '#e74c3c'
        },
        start_success: {
            title: '✅ Sessione Avviata',
            description: 'La tua sessione è stata aperta correttamente. Dirigiti nel canale <#{channelId}> per iniziare la compilazione.',
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
        modal_title: 'Dettagli Background',
        link_label: 'Link al Background (es. Google Doc)',
        desc_label: 'Breve Descrizione (Opzionale)',
        desc_placeholder: 'Riassumi qui la storia del tuo personaggio...',
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
            title: '📖 Nuovo Background Ricevuto',
            description: 'Un utente ha inviato un background per la revisione.\n\n**Utente:** <@{userId}>\n**Link:** [Apri Documento]({bg_link})\n**Descrizione:** {bg_desc}\n**ID:** `{app_id}`',
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
        cooldown_error: {
            title: '⚠️ Protocollo Cooldown',
            description: 'Hai inviato un background troppo recentemente. Potrai sottomettere una nuova versione tra **{time}**.',
            color: '#f1c40f'
        },
        already_exists: {
            title: '📄 Dossier Già Esistente',
            description: 'Risulta già un background in corso o sottomesso per questo utente.',
            color: '#3498db'
        },
        submission_success: {
            title: '✅ Dossier Sottomesso',
            description: 'La tua documentazione è stata inviata correttamente agli uffici competenti.',
            color: '#2ecc71'
        },
        approve_btn: 'Accetta',
        deny_btn: 'Rifiuta',
        accepted_title: '✅ Dossier APPROVATO',
        rejected_title: '❌ Dossier RESPINTO',
        staff_tag: '👮 Ufficiale',
        subject_tag: '👤 Soggetto',
        outcome_tag: 'Esito Staff'
    },
    staffapps: {
        panel: {
            title: '🛡️ Reclutamento Staff - Portale Candidature',
            description: 'Vuoi entrare a far parte del nostro team? Inviando la tua candidatura verrai valutato dai responsabili HR.\n\nAssicurati di rispondere in modo esaustivo a tutte le domande.',
            color: '#a855f7',
            footer: 'Dipartimento HR | {guild}'
        },
        dm_accepted: {
            title: '🎊 Candidatura Accettata!',
            description: 'Ottime notizie {user}! La tua candidatura per lo staff di {guild} è stata approvata. Benvenuto nel team!',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Candidatura Respinta',
            description: 'Siamo spiacenti {user}, ma la tua candidatura per {guild} non è stata approvata.\n\n**Motivazione:**\n>>> {reason}',
            color: '#ff4757'
        },
        staff_received: {
            title: '🛡️ Nuova Candidatura Staff',
            description: 'L\'utente **<@{userId}>** ha inviato una nuova candidatura per il team staff.',
            color: '#a855f7'
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
        created_success: {
            title: '✅ Ticket Creato',
            description: 'Il tuo ticket è stato aperto con successo in <#{channelId}>.',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Ticket Chiuso',
            description: 'Questo ticket è stato chiuso e archiviato correttamente.',
            color: '#E74C3C'
        },
        close_started: {
            title: '🔒 Chiusura in Corso',
            description: 'Il ticket sta per essere chiuso e archiviato. Attendere...',
            color: '#e67e22'
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
        claim_already: {
            title: '⚠️ Già Gestito',
            description: 'Questo ticket è già stato preso in carico da <@{staffId}>.',
            color: '#f1c40f'
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
        },
        priority_select: {
            title: '⚡ Selezione Priorità',
            description: 'Per favore, seleziona il livello di priorità per questa pratica prima di procedere.',
            color: '#f1c40f'
        },
        quick_reply_menu: {
            title: '📝 Risposte Rapide',
            description: 'Seleziona un template di risposta da inviare nel ticket.',
            color: '#3498db'
        },
        tag_menu: {
            title: '🏷️ Gestione Tag',
            description: 'Seleziona un tag da aggiungere o rimuovere da questo ticket.',
            color: '#3498db'
        },
        staff_only: {
            title: '⚠️ Accesso Riservato',
            description: 'Spiacente, ma solo i membri dello staff possono utilizzare queste funzioni di gestione.',
            color: '#e74c3c'
        },
        blacklist_error: {
            title: '🚫 Accesso Negato',
            description: 'Il tuo account è stato inserito nella blacklist del sistema ticket. Non puoi aprire nuove richieste.',
            color: '#e74c3c'
        },
        note_success: {
            title: '✅ Nota Aggiunta',
            description: 'La nota interna è stata registrata con successo nel database del ticket.',
            color: '#2ecc71'
        },
        config_not_found: {
            title: '❌ Configurazione Mancante',
            description: 'Il sistema ticket non è ancora stato configurato per questo server. Contatta gli amministratori.',
            color: '#e74c3c'
        },
        category_not_available: {
            title: '❌ Categoria Non Disponibile',
            description: 'La categoria selezionata non risulta più disponibile o è stata rimossa dallo staff.',
            color: '#e74c3c'
        },
        staff_ticket_log: {
            title: '📂 Log Ticket Chiuso',
            description: '>>> **Utente:** {user}\n**Tipo:** `{type}`\n**Operatore:** {staff}',
            color: '#3498db'
        },
        intelligence: {
            title: '🔍 Intelligence: {user}',
            prev_tickets: '🎫 Ticket Precedenti',
            sessions_closed: '`{count}` sessioni chiuse',
            whitelist: '📋 Whitelist',
            status: 'Stato: `{status}`',
            no_app: 'Nessuna domanda',
            last_wl: '📅 Ultima Whitelist',
            background: '📖 Background',
            no_dossier: 'Nessuna istanza',
            footer: 'Modulo Intelligence Staff',
            field_name: '🔍 Intelligence Utente'
        },
        claim_success: {
            title: '✅ Presa in Carico',
            description: 'Il ticket è stato preso in carico con successo.',
            color: '#2ecc71'
        },
        status_updated_msg: {
            title: '🔄 Stato Aggiornato',
            description: 'Lo stato del ticket è stato aggiornato a: **{status}**',
            color: '#3498db'
        },
        new_ticket_ping: {
            title: '🔔 Nuovo Ticket',
            description: '{ping} - Nuova istanza di tipo **{type}** aperta.',
            color: '#3498db'
        },
        cooldown: {
            title: '⚠️ Traffico Elevato',
            description: 'Attendi qualche minuto prima di aprire un nuovo ticket.',
            color: '#f1c40f'
        },
        note_modal_title: 'Aggiungi Nota Interna',
        note_input_label: 'Contenuto della nota',
        note_input_placeholder: 'Scrivi qui una nota visibile solo allo staff...',
        report_modal_title: 'Modulo Segnalazione',
        report_subject_label: 'Soggetto',
        report_desc_label: 'Descrizione',
        no_quick_replies: '❌ Nessuna risposta rapida configurata.',
        quick_reply_placeholder: 'Scegli un template...',
        tag_placeholder: 'Seleziona un tag...',
        waiting_staff: '_In attesa..._',
        priority_placeholder: 'Seleziona la priorità...',
        priority_normal: 'Normale',
        priority_important: 'Importante',
        priority_urgent: 'Urgente',
        claim_btn: 'Assumi',
        close_btn: 'Chiudi',
        quick_reply_btn: 'Risposte Rapide',
        note_btn: 'Nota',
        status_placeholder: 'Cambia stato...',
        status_processing: 'In Lavorazione',
        status_waiting: 'In Attesa (Utente)',
        assigned_staff_label: '👤 Operatore Assegnato',
        internal_notes_label: '📝 Note Interne'
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
    welcome: {
        join: {
            title: '👋 Benvenuto nel Server!',
            description: 'Ciao **{user}**, benvenuto su **{guild}**! Siamo felici di averti con noi.\n\nAssicurati di leggere il regolamento per una permanenza piacevole.',
            color: '#2ecc71'
        },
        leave: {
            title: '👋 Arrivederci!',
            description: '**{user}** ha lasciato il server. Speriamo di rivederti presto!',
            color: '#e74c3c'
        }
    },
    voice: {
        control_panel: {
            title: '🎙️ Pannello di Controllo Vocale',
            description: 'Benvenuto <@{user}>! Questo è il tuo canale temporaneo.\nUsa i tasti qui sotto per gestirlo rapidamente.',
            color: '#5865F2'
        },
        status_none: 'Nessuno',
        owner_field: '👑 Proprietario',
        limit_field: '👥 Limite'
    },
    moderation: {
        no_reason: 'Nessun motivo fornito',
        error: {
            title: '❌ Errore Moderazione',
            description: 'Si è verificato un errore durante l\'esecuzione del comando.',
            color: '#e74c3c'
        },
        command_ban: {
            title: '✅ Ban Eseguito',
            description: 'L\'utente **{user}** è stato bannato con successo.\n\n**Motivo:** {reason}',
            color: '#2ecc71'
        },
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
        },
        level_required: {
            title: '🛡️ Requisito di Livello Non Soddisfatto',
            description: 'Devi essere almeno di **Livello {minLevel}** per partecipare a questo giveaway!\nIl tuo livello attuale è **Livello {currentLevel}**.',
            color: '#e74c3c'
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
    },
    logs: {
        message_deleted: {
            title: '🗑️ Messaggio Eliminato',
            author: 'Autore',
            channel: 'Canale',
            content: 'Contenuto',
            no_text: '*Nessun testo (forse un embed o file)*',
            color: '#e74c3c'
        },
        message_updated: {
            title: '📝 Messaggio Modificato',
            author: 'Autore',
            channel: 'Canale',
            before: 'Prima',
            after: 'Dopo',
            color: '#3498db'
        }
    },
    admin: {
        embed_editor: {
            title: '🛠️ Editor Embed',
            description: 'Stai modificando un messaggio predefinito. Usa i pulsanti per cambiare i campi.',
            color: '#F1C40F'
        }
    },
    socials: {
        twitch: {
            title: '📡 **{streamer}** è in diretta!',
            description: '### {title}\n\nEhi! **{streamer}** ha appena acceso la camera su Twitch. Non perderti lo show!\n\n[Entra in Live]({url})',
            color: '#6441a5',
            footer: 'Notifiche Social | Verix'
        },
        youtube: {
            title: '🎥 Nuovo video di **{streamer}**!',
            description: '### {title}\n\nÈ appena uscito un nuovo video sul canale! Corri a lasciare un like.',
            color: '#ff0000',
            footer: 'Notifiche Social | Verix'
        },
        twitter: {
            title: '𝕏 (Twitter) Nuovo post di **{streamer}**',
            description: '{description}',
            color: '#000000',
            footer: 'Notifiche Social | Verix'
        },
        instagram: {
            title: '📸 Nuovo post di **{streamer}**',
            description: '### {title}\n\nNuovo contenuto caricato su Instagram! Passa a dare un\'occhiata.',
            color: '#e1306c',
            footer: 'Notifiche Social | Verix'
        },
        tiktok: {
            title: '🎵 Nuovo TikTok di **{streamer}**',
            description: '### {title}\n\nÈ appena stato pubblicato un nuovo video su TikTok! Guarda subito.',
            color: '#000000',
            footer: 'Notifiche Social | Verix'
        },
        reddit: {
            title: '👾 Nuovo Post su **r/{username}**!',
            description: '### {title}\n\n**{author}** ha pubblicato un nuovo post su **r/{username}**!\n\n{description}',
            color: '#ff4500',
            footer: 'Notifiche Social | Verix'
        },
        steam: {
            title: '🎮 Nuovo Annuncio per **{username}**!',
            description: '### {title}\n\n**{username}** ha rilasciato un nuovo annuncio/aggiornamento!\n\n{description}',
            color: '#1b2838',
            footer: 'Notifiche Social | Verix'
        },
        default_titles: {
            Twitch: '📡 **{streamer}** è in diretta!',
            YouTube: '🎥 Nuovo video di **{streamer}**!',
            Twitter: '𝕏 (Twitter) Nuovo post di **{streamer}**',
            Instagram: '📸 Nuovo post di **{streamer}**',
            TikTok: '🎵 Nuovo TikTok di **{streamer}**',
            Reddit: '👾 Nuovo Post su **r/{username}**!',
            Steam: '🎮 Nuovo Annuncio per **{username}**!'
        },
        default_descriptions: {
            Twitch: '### {title}\n\nEhi! **{streamer}** ha appena acceso la camera su Twitch. Non perderti lo show!\n\n[Entra in Live]({url})',
            YouTube: '### {title}\n\nÈ appena uscito un nuovo video sul canale! Corri a lasciare un like.',
            Twitter: '{description}',
            Instagram: '### {title}\n\nNuovo contenuto caricato su Instagram! Passa a dare un\'occhiata.',
            TikTok: '### {title}\n\nÈ appena stato pubblicato un nuovo video su TikTok! Guarda subito.',
            Reddit: '### {title}\n\n**{author}** ha pubblicato un nuovo post su **r/{username}**!\n\n{description}',
            Steam: '### {title}\n\n**{username}** ha rilasciato un nuovo annuncio/aggiornamento!\n\n{description}'
        },
        button_labels: {
            Twitch: 'Guarda la Live',
            YouTube: 'Guarda il Video',
            Twitter: 'Vedi su 𝕏',
            X: 'Vedi su 𝕏',
            Instagram: 'Vedi su Instagram',
            TikTok: 'Vedi su TikTok',
            Reddit: 'Vedi su Reddit',
            Steam: 'Vedi su Steam',
            default: 'Apri Link'
        },
        footer: 'Notifiche Social | Verix'
    },
    leveling: {
        disabled: {
            title: '📡 Modulo Disattivato',
            description: 'Il modulo **Leveling & Rewards** è attualmente disattivato in questo server. Contatta lo staff per maggiori informazioni.',
            color: '#f1c40f'
        },
        rank: {
            title: '✨ Scheda Livello - {username}',
            level: '📊 Livello',
            rank: '🏆 Posizione',
            xp: '🧪 Progresso XP',
            progress: '📈 Progressione',
            messages: '💬 Messaggi Totali',
            daily_limit: '📅 Limite Giornaliero',
            color: '#5865f2'
        },
        leaderboard: {
            title: '🏆 Classifica del Server',
            empty_title: '⚠️ Classifica Vuota',
            empty_desc: 'La classifica è attualmente vuota. Inizia a scrivere messaggi per guadagnare XP!',
            entry: '{pos} <@{userId}> • **Liv {level}** ({xp} XP)',
            footer: 'Tua Posizione: {rank} | Community Attiva',
            unranked: 'Non Classificato',
            color: '#5865f2'
        }
    },
    common: {
        no_reason: 'Nessuna motivazione fornita',
        none: 'Nessuno',
        loading: 'Caricamento in corso...',
        error: 'Si è verificato un errore.',
        immediately: 'subito'
    }
};
