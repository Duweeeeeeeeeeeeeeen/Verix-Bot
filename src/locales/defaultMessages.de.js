export default {
    "system": {
        "no_permission": {
            "title": "⚠️ Zugriff verweigert",
            "description": "Sie verfügen nicht über die erforderlichen Berechtigungen, um diesen Vorgang auszuführen. Wenden Sie sich an einen Administrator, wenn Sie glauben, dass es sich hierbei um einen Fehler handelt.",
            "color": "#e74c3c"
        },
        "module_disabled": {
            "title": "📡 Modul deaktiviert",
            "description": "Das Modul **{module}** ist derzeit auf diesem Server deaktiviert. Für weitere Informationen wenden Sie sich bitte an die Mitarbeiter.",
            "color": "#f1c40f"
        },
        "role_hierarchy": {
            "title": "⚖️ Rollenhierarchie",
            "description": "Rolle **{role}** kann nicht zugewiesen werden. Der Bot kann keine höheren oder gleichen Rollen in der Serverhierarchie verwalten.",
            "color": "#e74c3c"
        },
        "generic_error": {
            "title": "❌ Systemfehler",
            "description": "Während der Verarbeitung ist ein unerwarteter Fehler aufgetreten. Techniker wurden informiert.",
            "color": "#e74c3c"
        },
        "setup_success": {
            "title": "✅ Einrichtung abgeschlossen",
            "description": "Das Modul wurde korrekt konfiguriert und ist nun betriebsbereit.",
            "color": "#2ecc71"
        },
        "module_list": {
            "title": "⚙️ Modulverwaltung",
            "description": "Liste der aktuell im System geladenen Module:",
            "color": "#5865f2"
        },
        "module_enabled": {
            "title": "✅ Modul aktiviert",
            "description": "Das Modul **{module}** wurde erfolgreich aktiviert.",
            "color": "#2ecc71"
        },
        "module_disabled_success": {
            "title": "❌ Modul deaktiviert",
            "description": "Das Modul **{module}** wurde aus dem System entfernt. Alle damit verbundenen Funktionen werden ausgesetzt.",
            "color": "#e74c3c"
        },
        "module_already_in_state": {
            "title": "ℹ️ Server Unverändert",
            "description": "Das Modul **{module}** befindet sich bereits im angeforderten Zustand.",
            "color": "#3498db"
        },
        "module_not_found": {
            "title": "❌ Modul nicht gefunden",
            "description": "Das Modul **{module}** ist nicht im System registriert.",
            "color": "#e74c3c"
        }
    },
    "utility": {
        "clear_success": {
            "title": "🧹 Chat-Bereinigung",
            "description": "**{amount}** Nachrichten erfolgreich gelöscht.",
            "color": "#2ecc71"
        },
        "clear_no_messages": {
            "title": "⚠️ Keine Nachrichten gefunden",
            "description": "Es wurden keine Nachrichten gefunden, die den Löschkriterien entsprechen.",
            "color": "#f1c40f"
        },
        "clear_error": {
            "title": "❌ Bereinigungsfehler",
            "description": "Beim Löschen ist ein Fehler aufgetreten. Hinweis: Nachrichten, die älter als 14 Tage sind, können nicht massenhaft gelöscht werden.",
            "color": "#e74c3c"
        },
        "ping": {
            "title": "🏓 Verbindungsstatus",
            "description": ">>> **Latenz:**",
            "color": "#3498db"
        }
    },
    "whitelist": {
        "panel": {
            "title": "Serveranwendung",
            "description": "Beantragen Sie den Zugang zur **{guild}**. Die Mitarbeiter werden Ihre Antworten prüfen und sich mit Ihnen in Verbindung setzen, sobald eine Entscheidung vorliegt.",
            "color": "#3BA4FF",
            "footer": "{guild}} Anwendungen"
        },
        "start": {
            "title": "Anwendung gestartet: {user_name}",
            "description": "Willkommen. Bitte beantworten Sie jede Frage klar und ausführlich.",
            "color": "#3BA4FF",
            "footer": "{guild}} Bewerbungen"
        },
        "question": {
            "title": "Frage {current_index} von {total_questions}",
            "description": ">>> {question}",
            "color": "#3BA4FF"
        },
        "review": {
            "title": "Überprüfen Sie Ihre Antworten",
            "description": "Überprüfen Sie Ihre Antworten, bevor Sie sie absenden. Sobald Ihre Bewerbung bestätigt ist, wird sie zur Prüfung an die Mitarbeiter weitergeleitet.",
            "color": "#2ecc71"
        },
        "not_configured": {
            "title": "Anwendung nicht bereit",
            "description": "Dieses Anwendungssystem ist noch nicht vollständig konfiguriert. Bitte wenden Sie sich an die Mitarbeiter oder versuchen Sie es später noch einmal.",
            "color": "#f1c40f"
        },
        "active_session": {
            "title": "Bewerbung bereits geöffnet",
            "description": "Sie haben bereits eine offene Bewerbung in <#{channelId}>. Beenden Sie diese Sitzung, bevor Sie eine andere beginnen.",
            "color": "#3498db"
        },
        "already_submitted": {
            "title": "Antrag wird geprüft",
            "description": "Ihre Bewerbung wurde bereits eingereicht. Die Mitarbeiter werden es überprüfen und Sie benachrichtigen, wenn es eine Aktualisierung gibt.",
            "color": "#3498db"
        },
        "already_passed": {
            "title": "Bereits genehmigt",
            "description": "Aus unseren Unterlagen geht hervor, dass Sie bereits für die **{guild}** zugelassen wurden.",
            "color": "#2ecc71"
        },
        "cooldown": {
            "title": "Abklingzeit aktiv",
            "description": "Sie müssen **{time}** warten, bevor Sie einen weiteren Antrag einreichen.",
            "color": "#e74c3c"
        },
        "start_success": {
            "title": "Anwendung erstellt",
            "description": "Ihr privater Anwendungskanal ist bereit: <#{channelId}>.",
            "color": "#2ecc71"
        },
        "session_completed": {
            "title": "Antworten vollständig",
            "description": "Sie haben alle Fragen beantwortet. Überprüfen Sie Ihre Antworten oben und bestätigen oder brechen Sie die Übermittlung ab.",
            "color": "#3498db"
        },
        "min_length_error": {
            "title": "Weitere Details erforderlich",
            "description": "Ihre Antwort muss mindestens **{minLength}** Zeichen enthalten. Bitte fügen Sie weitere Details hinzu und versuchen Sie es erneut.",
            "color": "#f1c40f"
        },
        "dm_accepted": {
            "title": "Antrag genehmigt",
            "description": "Herzlichen Glückwunsch {user}! Ihre Bewerbung für **{guild}}** wurde genehmigt.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Antrag abgelehnt",
            "description": "Deine Bewerbung für **{guild}}** wurde nicht genehmigt.",
            "color": "#e74c3c"
        },
        "dm_voice_rejected": {
            "title": "Sprachinterview abgelehnt",
            "description": "Ihr Sprachinterview für **{guild}}** wurde nicht genehmigt. Bitte überprüfen Sie die Anforderungen, bevor Sie es erneut versuchen.",
            "color": "#e74c3c"
        },
        "dm_text_pass": {
            "title": "Schriftlicher Schritt genehmigt",
            "description": "Du hast den schriftlichen Schritt für **{guild}}** bestanden. Treten Sie dem konfigurierten Sprachkanal bei, wenn Sie für das Interview bereit sind.",
            "color": "#f1c40f"
        },
        "staff_received": {
            "title": "Neuer Antrag eingereicht",
            "description": "**{user_name}** hat einen Antrag auf Überprüfung eingereicht.",
            "color": "#3498db"
        },
        "dm_submitted": {
            "title": "Bewerbung eingegangen",
            "description": "Ihre Bewerbung für **{guild}}** wurde eingereicht. Die Mitarbeiter werden es bald überprüfen und Sie benachrichtigen, wenn es ein Ergebnis gibt.",
            "color": "#3498db"
        },
        "submission_confirmed": {
            "title": "Antrag eingereicht",
            "description": "Ihre Bewerbung wurde an die Mitarbeiter gesendet. Sie werden benachrichtigt, wenn eine Entscheidung vorliegt.",
            "color": "#2ecc71"
        },
        "voice_procedural_error": {
            "title": "Sprachinterview nicht verfügbar",
            "description": "Für diesen Bewerbungsablauf ist kein Sprachinterview verfügbar.",
            "color": "#e74c3c"
        },
        "queue_log": {
            "title": "Neuer Sprachwarteschlangeneintrag",
            "description": "{user} wartet auf ein Sprachinterview.",
            "color": "#3498db"
        },
        "already_exists": {
            "title": "Anwendung existiert bereits",
            "description": "Sie haben bereits eine aktive oder eingereichte Bewerbung.",
            "color": "#f1c40f"
        },
        "app_not_found": {
            "title": "Anwendung nicht gefunden",
            "description": "Die angeforderte Anwendung konnte nicht gefunden werden.",
            "color": "#e74c3c"
        },
        "cooldown_error": {
            "title": "Abklingzeit aktiv",
            "description": "Bitte warten Sie **{time}**, bevor Sie eine weitere Bewerbung einreichen.",
            "color": "#f1c40f"
        },
        "edit_closed": {
            "title": "Bearbeiten geschlossen",
            "description": "Das Bearbeitungsmenü wurde geschlossen. Sie können nun fortfahren.",
            "color": "#2ecc71"
        },
        "edit_error": {
            "title": "Bearbeitungsfehler",
            "description": "Ihre Antwort konnte nicht bearbeitet werden. {Grund}",
            "color": "#e74c3c"
        },
        "edit_menu": {
            "title": "Anwendung bearbeiten",
            "description": "Wählen Sie im Menü unten die Antwort aus, die Sie bearbeiten möchten.",
            "color": "#3498db"
        },
        "edit_success": {
            "title": "Antwort aktualisiert",
            "description": "Ihre Antwort auf die Frage **{index}** wurde erfolgreich gespeichert.",
            "color": "#2ecc71"
        },
        "promote_vip_success": {
            "title": "Priorität aktualisiert",
            "description": "Benutzer <@{userId}> wurde an den Anfang der Warteschlange verschoben.",
            "color": "#2ecc71"
        },
        "session_cancelled": {
            "title": "Sitzung abgebrochen",
            "description": "Die Sitzung wurde abgebrochen. Dieser Kanal wird in **{time}** entfernt.",
            "color": "#e74c3c"
        },
        "session_not_found": {
            "title": "Sitzung nicht gefunden",
            "description": "Die angeforderte Sitzung konnte nicht gefunden werden.",
            "color": "#e74c3c"
        },
        "setup_success": {
            "title": "Whitelist konfiguriert",
            "description": "Das Whitelist-Panel wurde erfolgreich konfiguriert.",
            "color": "#2ecc71"
        },
        "skip_error_no_session": {
            "title": "Keine aktive Sitzung",
            "description": "Es gibt keine aktive Sprachsitzung zum Überspringen.",
            "color": "#e74c3c"
        },
        "skip_success": {
            "title": "Sitzung übersprungen",
            "description": "Die aktuelle Sprachsitzung wurde übersprungen.",
            "color": "#3498db"
        },
        "voice_guide": {
            "title": "Leitfaden für Sprachinterviews",
            "description": "Sie bewerten den Benutzer **<@{userId}>**. Verwenden Sie die folgenden Steuerelemente, um das Interview zu genehmigen oder abzulehnen.",
            "color": "#3498db"
        },
        "next_step_written": "Der nächste Schritt besteht darin, den schriftlichen Test abzuschließen. Wenn Sie fertig sind, klicken Sie auf die Schaltfläche unten.",
        "next_step_voice": "Der nächste Schritt besteht darin, den Sprachtest abzuschließen. Bitte warten Sie, bis ein Mitarbeiter zu Ihnen kommt.",
        "written_finish": "Ihr Whitelist-Prozess ist abgeschlossen.",
        "start_written": "Schriftlichen Test starten",
        "bg_story_title": "Charaktergeschichte von {user}",
        "written_archive_title": "Schriftliche Antworten von {user}",
        "voice_staff_present": "Personal anwesend",
        "bg_not_accepted": "Ihr Hintergrund wurde noch nicht genehmigt.",
        "written_not_accepted": "Ihr schriftlicher Antrag wurde noch nicht genehmigt.",
        "voice_rejection_cooldown": "Sie müssen {Stunden} Stunde(n) warten, bevor Sie ein weiteres Sprachinterview versuchen.",
        "vip_priority": "VIP-Priorität aktiv.",
        "voice_session_start_log": "Voice-Whitelist-Sitzung für {user} in {channel} gestartet.",
        "no_written_found": "Es wurden keine schriftlichen Bewerbungsantworten gefunden.",
        "session_expired_title": "Sitzung abgelaufen",
        "session_expired_desc": "Diese Anwendungssitzung ist abgelaufen und wurde geschlossen.",
        "time_expired_title": "Zeit abgelaufen",
        "time_expired_desc": "Die Bewerbungsfrist ist abgelaufen. Bitte starten Sie bei Bedarf eine neue Sitzung.",
        "rejection_modal_title": "Ablehnung des Antrags",
        "rejection_modal_label": "Ablehnungsgrund",
        "rejection_modal_placeholder": "Beispiel: Antworten zu kurz, Anforderungen nicht erfüllt...",
        "approved_title": "Antrag genehmigt",
        "rejected_title": "Antrag abgelehnt",
        "written_step_approved": "Schriftlicher Schritt genehmigt",
        "approved_by": "Genehmigt von {staff}",
        "rejected_by": "Abgelehnt von {staff}",
        "written_step_approved_by": "Schriftlicher Schritt genehmigt von {staff}",
        "waiting_voice_interview": "Warten auf Sprachinterview",
        "dm_notification": "DM-Benachrichtigung",
        "bg_link_label": "Hintergrundlink",
        "bg_link_value": "[Dokument öffnen]({link})",
        "confirm_btn": "Bewerbung bestätigen",
        "edit_btn": "Antworten bearbeiten",
        "cancel_btn": "Bewerbung abbrechen",
        "close_btn": "Menü schließen",
        "done_btn": "Fertig"
    },
    "background": {
        "panel": {
            "title": "Hintergrundübermittlung",
            "description": "Senden Sie Ihre Hintergrundinformationen zur Überprüfung durch die Mitarbeiter.",
            "color": "#5865f2",
            "footer": "{guild}} Hintergrundüberprüfung"
        },
        "instructions": {
            "title": "Hintergrundanweisungen",
            "description": "Nutzen Sie diesen Kanal, um Ihren Hintergrund vorzubereiten und zur Überprüfung einzureichen.",
            "color": "#3498db"
        },
        "modal_title": "Hintergrunddetails",
        "link_label": "Hintergrundlink (z. B. Google Doc)",
        "desc_label": "Kurzbeschreibung (optional)",
        "desc_placeholder": "Fassen Sie hier Ihre Hintergrundeinreichung zusammen...",
        "dm_accepted": {
            "title": "Hintergrund genehmigt",
            "description": "Dein Hintergrund für **{guild}}** wurde genehmigt.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Hintergrund abgelehnt",
            "description": "Dein Hintergrund für **{guild}}** wurde nicht genehmigt.",
            "color": "#e74c3c"
        },
        "staff_received": {
            "title": "Neuer Hintergrund eingereicht",
            "description": "Ein Benutzer hat einen Hintergrund zur Überprüfung eingereicht.",
            "color": "#3498db"
        },
        "approve_btn": "Genehmigen",
        "deny_btn": "Ablehnen",
        "submit_btn": "Senden",
        "cancel_btn": "Abbrechen",
        "accepted_title": "Hintergrund genehmigt",
        "rejected_title": "Hintergrund abgelehnt",
        "staff_tag": "Mitarbeiter",
        "subject_tag": "Bewerber",
        "outcome_tag": "Mitarbeiterergebnis",
        "already_exists": {
            "title": "Hintergrund bereits übermittelt",
            "description": "Sie haben bereits eine aktive Hintergrundanfrage oder eine, die auf Überprüfung wartet.",
            "color": "#f1c40f"
        },
        "channel_created": {
            "title": "Hintergrundsitzung gestartet",
            "description": "Ihr Hintergrund-Einreichungskanal ist bereit: {channel}",
            "color": "#2ecc71"
        },
        "cooldown": {
            "title": "Abklingzeit aktiv",
            "description": "Sie haben zu spät einen Hintergrund eingereicht. Sie können {time_left} eine weitere einreichen.",
            "color": "#f1c40f"
        },
        "cooldown_error": {
            "title": "Abklingzeit aktiv",
            "description": "Bitte warten Sie **{time}**, bevor Sie mit einer neuen Hintergrundübermittlung beginnen.",
            "color": "#f1c40f"
        },
        "dm_received": {
            "title": "Hintergrund empfangen",
            "description": "Dein Hintergrund für **{guild}}** wurde empfangen. Die Mitarbeiter werden es bald überprüfen.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Hintergrundfehler",
            "description": "Bei der Verarbeitung des Hintergrunds ist ein Fehler aufgetreten. {Grund}",
            "color": "#e74c3c"
        },
        "session_cancelled": {
            "title": "Sitzung abgebrochen",
            "description": "Die Hintergrundübermittlung wurde abgebrochen. Dieser Kanal wird in **{time}** entfernt.",
            "color": "#e74c3c"
        },
        "submission_success": {
            "title": "Hintergrund eingereicht",
            "description": "Ihr Hintergrund wurde erfolgreich übermittelt. Die Mitarbeiter werden es bald überprüfen.",
            "color": "#2ecc71"
        },
        "upload_success": {
            "title": "Anhang gespeichert",
            "description": "Die Datei wurde erfolgreich gespeichert.",
            "color": "#2ecc71"
        }
    },
    "staffapps": {
        "panel": {
            "title": "📝 Bewerbungsportal",
            "description": "Möchten Sie eine Bewerbung einreichen? Klicken Sie auf die Schaltfläche unten, um zu beginnen.",
            "color": "#a855f7",
            "footer": "Bewerbungsportal | {guild}"
        },
        "dm_accepted": {
            "title": "🎊 Bewerbung angenommen!",
            "description": "Tolle Neuigkeiten {user}! Dein Antrag für {guild}} wurde genehmigt!",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "❌ Antrag abgelehnt",
            "description": "Es tut uns leid, {user}, aber Ihr Antrag für {guild}} wurde nicht genehmigt.",
            "color": "#ff4757"
        },
        "staff_received": {
            "title": "📩 Neue Bewerbung eingegangen",
            "description": "Benutzer **<@{userId}>** hat einen neuen Antrag eingereicht.",
            "color": "#a855f7"
        }
    },
    "tickets": {
        "panel": {
            "title": "🎫 Support Center",
            "description": "Benötigen Sie Hilfe oder möchten Sie ein Problem melden? Öffnen Sie ein Support-Ticket, indem Sie im Menü unten die richtige Kategorie auswählen.",
            "color": "#2ECC71",
            "footer": "Support-Team | {guild}"
        },
        "ticket": {
            "title": "📂 Support-Ticket: {type}",
            "description": "Willkommen, <@{user_id}>. Ein Mitarbeiter wird Ihr Anliegen in Kürze bearbeiten.",
            "color": "#2ECC71"
        },
        "success_open": {
            "title": "✅ Ticket erstellt",
            "description": "Ihr Ticket wurde erfolgreich geöffnet.",
            "color": "#2ecc71"
        },
        "created_success": {
            "title": "✅ Ticket erstellt",
            "description": "Ihr Ticket wurde erfolgreich in <#{channelId}> geöffnet.",
            "color": "#2ecc71"
        },
        "close": {
            "title": "🔒 Ticket geschlossen",
            "description": "Dieses Ticket wurde korrekt geschlossen und archiviert.",
            "color": "#E74C3C"
        },
        "close_started": {
            "title": "🔒 Abschluss im Gange",
            "description": "Das Ticket wird geschlossen und archiviert. Bitte warten...",
            "color": "#e67e22"
        },
        "already_exists": {
            "title": "⚠️ Vorhandenes Ticket",
            "description": "Sie haben bereits ein offenes Ticket vom Typ **{type}** im Kanal <#{channelId}>.",
            "color": "#f1c40f"
        },
        "staff_claimed": {
            "title": "⚙️ Behauptet",
            "description": "Der Mitarbeiter **{staff}** hat Ihr Ticket übernommen und wird Ihnen in Kürze weiterhelfen.",
            "color": "#3498db"
        },
        "claim_already": {
            "title": "⚠️ Bereits beansprucht",
            "description": "Dieses Ticket wurde bereits von <@{staffId}> beansprucht.",
            "color": "#f1c40f"
        },
        "status_updated": {
            "title": "🔄 Status aktualisiert",
            "description": "Der Ticketstatus wurde auf **{status}** gesetzt.",
            "color": "#3498db"
        },
        "inactivity_close": {
            "title": "⚠️ Wegen Inaktivität geschlossen",
            "description": "Dieses Ticket wurde aufgrund mangelnder Aktivität in letzter Zeit automatisch geschlossen.",
            "color": "#e74c3c"
        },
        "default_welcome": {
            "title": "🎫 Hilfeanfrage",
            "description": "Willkommen im Support-Center. Ein Mitarbeiter wird in Kürze hier sein.",
            "color": "#5865F2"
        },
        "priority_select": {
            "title": "⚡ Prioritätsauswahl",
            "description": "Bitte wählen Sie die Prioritätsstufe für dieses Ticket aus, bevor Sie fortfahren.",
            "color": "#f1c40f"
        },
        "quick_reply_menu": {
            "title": "📝 Schnelle Antworten",
            "description": "Wählen Sie eine Antwortvorlage aus, um das Ticket einzusenden.",
            "color": "#3498db"
        },
        "tag_menu": {
            "title": "🏷️ Tag-Management",
            "description": "Wählen Sie ein Tag aus, das diesem Ticket hinzugefügt oder daraus entfernt werden soll.",
            "color": "#3498db"
        },
        "staff_only": {
            "title": "⚠️ Eingeschränkter Zugang",
            "description": "Leider können diese Verwaltungsfunktionen nur von Mitarbeitern genutzt werden.",
            "color": "#e74c3c"
        },
        "blacklist_error": {
            "title": "🚫 Zugriff verweigert",
            "description": "Ihr Konto wurde vom Ticketsystem auf die schwarze Liste gesetzt. Sie können keine neuen Anfragen öffnen.",
            "color": "#e74c3c"
        },
        "note_success": {
            "title": "✅ Hinweis hinzugefügt",
            "description": "Die interne Notiz wurde erfolgreich in der Ticketdatenbank erfasst.",
            "color": "#2ecc71"
        },
        "config_not_found": {
            "title": "❌ Konfiguration fehlt",
            "description": "Das Ticketsystem wurde für diesen Server noch nicht konfiguriert. Kontaktieren Sie die Administratoren.",
            "color": "#e74c3c"
        },
        "category_not_available": {
            "title": "❌ Kategorie nicht verfügbar",
            "description": "Die ausgewählte Kategorie ist nicht mehr verfügbar oder wurde vom Personal entfernt.",
            "color": "#e74c3c"
        },
        "staff_ticket_log": {
            "title": "📂 Geschlossenes Ticketprotokoll",
            "description": ">>> **Benutzer:** {user}",
            "color": "#3498db"
        },
        "intelligence": {
            "title": "🔍 Intelligenz: {user}",
            "prev_tickets": "🎫 Vorherige Tickets",
            "sessions_closed": "„{count}“ geschlossene Sitzungen",
            "whitelist": "📋 Whitelist",
            "status": "Status: „{status}“.",
            "no_app": "Keine Anwendung",
            "last_wl": "📅 Letzte Whitelist",
            "background": "📖 Hintergrund",
            "no_application": "Keine Bewerbungen",
            "footer": "Staff Intelligence-Modul",
            "field_name": "🔍 Benutzerintelligenz"
        },
        "system_messages": {
            "priority_placeholder": "Priorität auswählen...",
            "priority_normal": "Normal",
            "priority_important": "Wichtig",
            "priority_urgent": "Dringend",
            "claim_btn": "Anspruch",
            "close_btn": "Schließen",
            "quick_reply_btn": "Schnelle Antworten",
            "note_btn": "Hinweis",
            "status_placeholder": "Status ändern...",
            "status_processing": "Verarbeitung",
            "status_waiting": "Warten (Benutzer)",
            "note_modal_title": "Interne Notiz hinzufügen",
            "note_input_label": "Inhalt notieren",
            "note_input_placeholder": "Schreiben Sie eine Notiz, die nur für Mitarbeiter sichtbar ist ...",
            "report_modal_title": "Berichtsformular",
            "report_subject_label": "Betreff",
            "report_desc_label": "Beschreibung",
            "no_quick_replies": "❌ Keine Schnellantworten konfiguriert.",
            "quick_reply_placeholder": "Wählen Sie eine Vorlage...",
            "tag_placeholder": "Wählen Sie ein Tag aus...",
            "claim_success": "✅ Ticket erfolgreich beansprucht.",
            "status_updated_msg": "✅ Ticketstatus aktualisiert auf: **{status}**",
            "assigned_staff_label": "👤 Zugewiesenes Personal",
            "internal_notes_label": "📝 Interne Notizen",
            "waiting_staff": "_Warten..._",
            "none": "_Keine_",
            "new_ticket_ping": "{ping} – Neues **{type}**-Ticket geöffnet.",
            "cooldown": "⚠️ **HIGH TRAFFIC:** Warten Sie ein paar Minuten, bevor Sie ein neues Ticket eröffnen.",
            "already_exists": "❌ **FEHLER:** Sie haben bereits ein **{type}** Ticket geöffnet.",
            "success_open": "✅ **TICKET GEÖFFNET:** Gehe zum Kanal {channel}.",
            "success_close": "🛡️ **ARCHIVIERUNG IN ARBEIT...**",
            "staff_claimed": "✅ **{staff}** hat das Ticket angefordert.",
            "claim_already": "❌ Dieses Ticket wurde bereits von <@{staffId}> beansprucht.",
            "staff_only": "⚠️ Eingeschränkter Zugang nur für Mitarbeiter.",
            "blacklist_error": "🚫 Du wurdest vom Ticketsystem auf die schwarze Liste gesetzt."
        },
        "claim_success": {
            "title": "Ticket beansprucht",
            "description": "Sie haben dieses Ticket erfolgreich beansprucht.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Ticketfehler",
            "description": "Die angeforderte Ticketaktion konnte nicht abgeschlossen werden. {Grund}",
            "color": "#e74c3c"
        },
        "generic_error": {
            "title": "Ticketfehler",
            "description": "Die angeforderte Ticketaktion konnte nicht abgeschlossen werden. {Grund}",
            "color": "#e74c3c"
        },
        "status_updated_msg": {
            "title": "Status aktualisiert",
            "description": "Ticketstatus wurde auf **{status}** aktualisiert.",
            "color": "#2ecc71"
        },
        "user_managed": {
            "title": "Ticket-Mitglied aktualisiert",
            "description": "Benutzer **{user}** war **{action}** vom Ticket.",
            "color": "#3498db"
        }
    },
    "verify": {
        "panel": {
            "title": "🛡️ Kontobestätigung",
            "description": "Um auf die Serverkanäle zugreifen zu können, müssen Sie Ihre Identität überprüfen. Klicken Sie auf die Schaltfläche unten, um fortzufahren.",
            "color": "#3BA4FF",
            "footer": "Sicherheitssystem | {guild}"
        },
        "success": {
            "title": "✅ Verifizierung abgeschlossen",
            "description": "Willkommen! Ihre Verifizierung bei **{guild}}** war erfolgreich. Sie haben nun Zugriff auf alle Kanäle.",
            "color": "#2ecc71"
        },
        "already_verified": {
            "title": "⚠️ Bereits verifiziert",
            "description": "Deine Identität ist bereits in der **{guild}}**-Datenbank überprüft.",
            "color": "#f1c40f"
        },
        "dm": {
            "title": "🎊 Willkommen auf dem Server",
            "description": "Du hast dich bei **{guild}}** erfolgreich verifiziert. Genießen Sie Ihren Aufenthalt und haben Sie Spaß!",
            "color": "#2ecc71"
        },
        "staff_log": {
            "title": "🛂 Verifizierungsprotokoll: Neues Mitglied",
            "description": "Ein neuer Benutzer hat die Verifizierung abgeschlossen.",
            "color": "#2ecc71"
        },
        "error": {
            "title": "Verifizierungsfehler",
            "description": "Bei der Verifizierung Ihres Kontos ist ein technisches Problem aufgetreten. Bitte versuchen Sie es später noch einmal oder wenden Sie sich an das Personal.",
            "color": "#e74c3c"
        },
        "role_not_found": {
            "title": "Verifizierungsrolle fehlt",
            "description": "Die Verifizierungsrolle ist nicht mehr verfügbar. Bitte wenden Sie sich an die Mitarbeiter.",
            "color": "#e74c3c"
        },
        "success_reply": {
            "title": "Überprüfung abgeschlossen",
            "description": "Willkommen {user}! Ihre Berechtigungen wurden aktualisiert.",
            "color": "#2ecc71"
        }
    },
    "fivem": {
        "status_embed": {
            "title": "🏙️ Stadtstatus: Online",
            "description": "Das Herz der Metropole ist aktiv. Mitglieder sind eingeladen, Kontakte zu knüpfen und ihren Tag zu beginnen.",
            "color": "#2ecc71",
            "footer": "Stadtüberwachung | Verix RP"
        },
        "offline_embed": {
            "title": "🔴 Stadtstatus: Offline",
            "description": "Achtung Mitglieder. Die Verbindung zur Metropole ist unterbrochen. Techniker arbeiten daran, Zugangsprotokolle wiederherzustellen.",
            "color": "#e74c3c",
            "footer": "Städtischer Notfall | Verix RP"
        }
    },
    "welcome": {
        "join": {
            "title": "👋 Willkommen auf dem Server!",
            "description": "Hallo **{user}**, willkommen bei **{guild}}**! Wir freuen uns, Sie bei uns zu haben.",
            "color": "#2ecc71"
        },
        "leave": {
            "title": "👋 Auf Wiedersehen!",
            "description": "**{user}** hat den Server verlassen. Wir hoffen, Sie bald wieder zu sehen!",
            "color": "#e74c3c"
        }
    },
    "voice": {
        "control_panel": {
            "title": "🎙️ Sprachsteuerung",
            "description": "Willkommen <@{user}>! Dies ist Ihr temporärer Kanal.",
            "color": "#5865F2"
        },
        "status_none": "Keine",
        "owner_field": "👑 Besitzer",
        "limit_field": "👥 Limit",
        "dm_accepted": {
            "title": "Sprachinterview genehmigt",
            "description": "Herzlichen Glückwunsch {user}! Ihr Sprachinterview für **{guild}}** wurde genehmigt.",
            "color": "#2ecc71"
        },
        "dm_rejected": {
            "title": "Sprachinterview abgelehnt",
            "description": "Ihr Sprachinterview für **{guild}}** wurde nicht genehmigt.",
            "color": "#e74c3c"
        },
        "staff_approved": {
            "title": "Sprachüberprüfung genehmigt",
            "description": "Benutzer **<@{userId}>** wurde von **{staff}** genehmigt.",
            "color": "#2ecc71"
        },
        "staff_denied": {
            "title": "Sprachüberprüfung abgelehnt",
            "description": "Benutzer **<@{userId}>** wurde von **{staff}** abgelehnt.",
            "color": "#e74c3c"
        },
        "rejection_modal_title": "Ablehnung eines Sprachinterviews",
        "rejection_modal_label": "Ablehnungsgrund"
    },
    "moderation": {
        "no_reason": "Kein Grund angegeben",
        "result": "Ergebnis",
        "reason": "Grund",
        "next_step": "Nächster Schritt",
        "sent": "Gesendet",
        "error": {
            "title": "❌ Moderationsfehler",
            "description": "Beim Ausführen des Befehls ist ein Fehler aufgetreten.",
            "color": "#e74c3c"
        },
        "command_ban": {
            "title": "✅ Verbot ausgeführt",
            "description": "Benutzer **{user}** wurde erfolgreich gesperrt.",
            "color": "#2ecc71"
        },
        "warn": {
            "title": "🛡️ Offizielle Warnung",
            "description": "Achtung **{user}**, Sie haben eine offizielle Verwarnung wegen Verstoßes gegen die Regeln erhalten.",
            "color": "#f1c40f",
            "footer": "Moderation | {guild}"
        },
        "timeout": {
            "title": "🔇 Vorübergehende Zeitüberschreitung",
            "description": "Benutzer **{user}** wurde vorübergehend für **{duration}** stummgeschaltet.",
            "color": "#e67e22"
        },
        "kick": {
            "title": "👢 Vom Server gekickt",
            "description": "Du wurdest wegen Regelverstoßes vom Server geworfen.",
            "color": "#e74c3c"
        },
        "ban": {
            "title": "🚫 Dauerhaftes Verbot",
            "description": "Ihr Zugriff auf diesen Server wurde dauerhaft widerrufen.",
            "color": "#000000"
        },
        "anti_raid": {
            "title": "Anti-Raid-Aktion",
            "description": "Ein verdächtiges Konto wurde hinzugefügt und vom Anti-Raid-System bearbeitet.",
            "color": "#e74c3c"
        },
        "command_kick": {
            "title": "Tritt ausgeführt",
            "description": "**Benutzer:** {user}",
            "color": "#e74c3c"
        },
        "dm_kick": {
            "title": "Vom Server entfernt",
            "description": "Du wurdest aus **{guild}}** entfernt.",
            "color": "#e74c3c"
        },
        "dm_ban": {
            "title": "Vom Server gesperrt",
            "description": "Du wurdest aus der **{guild}** verbannt.",
            "color": "#000000"
        },
        "ghost_ping": {
            "title": "Geister-Ping erkannt",
            "description": "**Benutzer:** {user}",
            "color": "#f59e0b"
        }
    },
    "giveaway": {
        "no_participants": {
            "title": "😔 Das Gewinnspiel ist beendet",
            "description": "Das Gewinnspiel für **{prize}** endete ohne gültige Teilnehmer.",
            "color": "#e74c3c"
        },
        "winners": {
            "title": "🎉 Gewinner der Verlosung!",
            "description": "Das Gewinnspiel für **{prize}** ist beendet!",
            "color": "#2ecc71"
        },
        "already_ended": {
            "title": "⚠️ Das Gewinnspiel ist bereits beendet",
            "description": "Entschuldigung, diese Verlosung ist bereits abgeschlossen.",
            "color": "#f1c40f"
        },
        "level_required": {
            "title": "🛡️ Levelanforderung nicht erfüllt",
            "description": "Sie müssen mindestens **Level {minLevel}** haben, um an dieser Verlosung teilzunehmen!",
            "color": "#e74c3c"
        }
    },
    "photocontest": {
        "panel": {
            "title": "📸 Fotowettbewerb",
            "description": "Nehmen Sie an unserem Fotowettbewerb teil! Laden Sie Ihr bestes Foto zum aktuellen Thema hoch.",
            "color": "#F39C12"
        },
        "submission": {
            "title": "🎨 Arbeit von {username}",
            "description": "Für den Wettbewerb wurde ein neues Foto hochgeladen.",
            "color": "#3498db"
        },
        "already_submitted": {
            "title": "Bereits übermittelt",
            "description": "Sie haben bereits ein Foto für diesen Wettbewerb eingereicht.",
            "color": "#f1c40f"
        },
        "already_voted_error": {
            "title": "Abstimmung bereits registriert",
            "description": "Sie haben bereits über diesen Beitrag abgestimmt.",
            "color": "#f1c40f"
        },
        "contest_end_log": {
            "title": "Fotowettbewerb beendet",
            "description": "Der Wettbewerb ist beendet.",
            "color": "#F39C12"
        },
        "entry_not_found_error": {
            "title": "Einreichung nicht gefunden",
            "description": "Diese Einreichung konnte nicht gefunden werden. Möglicherweise wurde es entfernt.",
            "color": "#e74c3c"
        },
        "error": {
            "title": "Fehler beim Fotowettbewerb",
            "description": "Bei der Verarbeitung der Fotowettbewerb-Aktion ist ein Fehler aufgetreten.",
            "color": "#e74c3c"
        },
        "error_no_participants": {
            "title": "Keine Teilnehmer",
            "description": "Der Fotowettbewerb endete ohne gültige Einsendungen.",
            "color": "#e74c3c"
        },
        "interaction_notify": {
            "title": "Neue Wettbewerbsinteraktion",
            "description": "Jemand hat mit Ihrem Fotowettbewerbsbeitrag interagiert.",
            "color": "#2ecc71"
        },
        "leaderboard": {
            "title": "Bestenliste des Fotowettbewerbs",
            "description": "{Liste}",
            "color": "#F39C12"
        },
        "leaderboard_display": {
            "title": "Bestenliste des Fotowettbewerbs",
            "description": "{Bestenliste}",
            "color": "#F39C12"
        },
        "leaderboard_error": {
            "title": "Bestenlistenfehler",
            "description": "Die Bestenliste des Fotowettbewerbs konnte nicht geladen werden.",
            "color": "#e74c3c"
        },
        "no_contest_active": {
            "title": "Kein aktiver Wettbewerb",
            "description": "Im Moment gibt es keinen aktiven Fotowettbewerb.",
            "color": "#f1c40f"
        },
        "no_submissions_leaderboard": {
            "title": "Keine Einsendungen",
            "description": "Es sind noch keine Einsendungen zum Anzeigen vorhanden.",
            "color": "#f1c40f"
        },
        "no_winners": {
            "title": "Noch keine Gewinner",
            "description": "Es sind noch keine früheren Gewinner verzeichnet.",
            "color": "#f1c40f"
        },
        "self_vote_error": {
            "title": "Abstimmung nicht erlaubt",
            "description": "Sie können nicht für Ihren eigenen Beitrag stimmen.",
            "color": "#f1c40f"
        },
        "submission_data_saved": {
            "title": "Einreichung gespeichert",
            "description": "Ihre Übermittlungsdaten wurden erfolgreich gespeichert.",
            "color": "#2ecc71"
        },
        "vote_success_down": {
            "title": "Abstimmung registriert",
            "description": "Ihr Downvote wurde registriert.",
            "color": "#e74c3c"
        },
        "vote_success_up": {
            "title": "Abstimmung registriert",
            "description": "Ihr Upvote wurde registriert.",
            "color": "#2ecc71"
        }
    },
    "logs": {
        "message_deleted": {
            "title": "🗑️ Nachricht gelöscht",
            "author": "Autor",
            "channel": "Kanal",
            "content": "Inhalt",
            "no_text": "*Kein Text (vielleicht eine Einbettung oder Datei)*",
            "color": "#e74c3c"
        },
        "message_updated": {
            "title": "📝 Nachricht aktualisiert",
            "author": "Autor",
            "channel": "Kanal",
            "before": "Vorher",
            "after": "Nachher",
            "color": "#3498db"
        }
    },
    "admin": {
        "embed_editor": {
            "title": "🛠️ Einbettungseditor",
            "description": "Sie bearbeiten eine Standardnachricht. Verwenden Sie die Schaltflächen, um Felder zu ändern.",
            "color": "#F1C40F"
        }
    },
    "socials": {
        "twitch": {
            "title": "📡 **{streamer}** ist live!",
            "description": "### {Titel}",
            "color": "#6441a5",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "youtube": {
            "title": "🎥 Neues Video von **{Streamer}**!",
            "description": "### {Titel}",
            "color": "#ff0000",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "twitter": {
            "title": "𝕏 (Twitter) Neuer Beitrag von **{streamer}**",
            "description": "{Beschreibung}",
            "color": "#000000",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "instagram": {
            "title": "📸 Neuer Beitrag von **{streamer}**",
            "description": "### {Titel}",
            "color": "#e1306c",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "tiktok": {
            "title": "🎵 Neues TikTok von **{streamer}**",
            "description": "### {Titel}",
            "color": "#000000",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "reddit": {
            "title": "👾 Neuer Beitrag auf **r/{username}**!",
            "description": "### {Titel}",
            "color": "#ff4500",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "steam": {
            "title": "🎮 Neue Ankündigung für **{username}**!",
            "description": "### {Titel}",
            "color": "#1b2838",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "kick": {
            "title": "Kick live: **{streamer}**",
            "description": "### {Titel}",
            "color": "#53fc18",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "github": {
            "title": "Neues GitHub-Update für **{username}**",
            "description": "### {Titel}",
            "color": "#24292f",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "rss": {
            "title": "Neues Update von **{username}**",
            "description": "### {Titel}",
            "color": "#f97316",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "telegram": {
            "title": "Neuer Telegram-Beitrag von **{username}**",
            "description": "{Beschreibung}",
            "color": "#26a5e4",
            "footer": "Soziale Benachrichtigungen | Verix"
        },
        "default_titles": {
            "Twitch": "📡 **{streamer}** ist live!",
            "YouTube": "🎥 Neues Video von **{Streamer}**!",
            "Twitter": "𝕏 (Twitter) Neuer Beitrag von **{streamer}**",
            "Instagram": "📸 Neuer Beitrag von **{streamer}**",
            "TikTok": "🎵 Neues TikTok von **{streamer}**",
            "Reddit": "👾 Neuer Beitrag auf **r/{username}**!",
            "Steam": "🎮 Neue Ankündigung für **{username}**!"
        },
        "default_descriptions": {
            "Twitch": "### {Titel}",
            "YouTube": "### {Titel}",
            "Twitter": "{Beschreibung}",
            "Instagram": "### {Titel}",
            "TikTok": "### {Titel}",
            "Reddit": "### {Titel}",
            "Steam": "### {Titel}"
        },
        "button_labels": {
            "Twitch": "Live ansehen",
            "YouTube": "Video ansehen",
            "Twitter": "Anzeigen auf 𝕏",
            "X": "Anzeigen auf 𝕏",
            "Instagram": "Auf Instagram ansehen",
            "TikTok": "Auf TikTok ansehen",
            "Reddit": "Ansicht auf Reddit",
            "Steam": "Auf Steam ansehen",
            "Kick": "Auf Kick ansehen",
            "GitHub": "Auf GitHub ansehen",
            "RSS": "Feed-Element öffnen",
            "Telegram": "Auf Telegram ansehen",
            "default": "Link öffnen"
        },
        "footer": "Soziale Benachrichtigungen | Verix"
    },
    "leveling": {
        "disabled": {
            "title": "📡 Modul deaktiviert",
            "description": "Das Modul **Leveling & Belohnungen** ist derzeit auf diesem Server deaktiviert. Für weitere Informationen wenden Sie sich bitte an die Mitarbeiter.",
            "color": "#f1c40f"
        },
        "rank": {
            "title": "✨ Rangkarte – {username}",
            "level": "📊 Level",
            "rank": "🏆 Rang",
            "xp": "🧪 XP-Fortschritt",
            "progress": "📈 Fortschritt",
            "messages": "💬 Gesamtnachrichten",
            "daily_limit": "📅 Tageslimit",
            "color": "#5865f2"
        },
        "leaderboard": {
            "title": "🏆 Server-Bestenliste",
            "empty_title": "⚠️ Bestenliste leer",
            "empty_desc": "Die Bestenliste ist derzeit leer. Beginnen Sie mit dem Versenden von Nachrichten, um XP zu verdienen!",
            "entry": "{pos} <@{userId}> • **Lvl {level}** ({xp} XP)",
            "footer": "Ihr Rang: {rank} | Aktive Gemeinschaft",
            "unranked": "Ohne Rang",
            "color": "#5865f2"
        }
    },
    "poll": {
        "ended": {
            "title": "Umfrage geschlossen",
            "description": "Diese Umfrage ist bereits beendet.",
            "color": "#f1c40f"
        },
        "invalid_option": {
            "title": "Ungültige Umfrageoption",
            "description": "Diese Umfrageoption ist nicht mehr verfügbar.",
            "color": "#e74c3c"
        },
        "vote_removed": {
            "title": "Abstimmung entfernt",
            "description": "Ihre Stimme wurde erfolgreich entfernt.",
            "color": "#2ecc71"
        },
        "vote_recorded": {
            "title": "Abstimmung aufgezeichnet",
            "description": "Ihre Stimme wurde erfolgreich registriert.",
            "color": "#2ecc71"
        }
    },
    "reactionroles": {
        "role_not_found": {
            "title": "Rolle nicht gefunden",
            "description": "Die konfigurierte Rolle existiert nicht mehr. Bitte wenden Sie sich an einen Administrator.",
            "color": "#e74c3c"
        },
        "role_removed": {
            "title": "Rolle entfernt",
            "description": "Rolle **{role}** erfolgreich entfernt.",
            "color": "#2ecc71"
        },
        "role_assigned": {
            "title": "Rolle zugewiesen",
            "description": "Rolle **{role}** erfolgreich zugewiesen.",
            "color": "#2ecc71"
        },
        "update_error": {
            "title": "Rollenaktualisierung fehlgeschlagen",
            "description": "Die Rolle konnte nicht aktualisiert werden. Überprüfen Sie die Bot-Berechtigungen und die Rollenhierarchie.",
            "color": "#e74c3c"
        }
    },
    "common": {
        "no_reason": "Kein Grund angegeben",
        "result": "Ergebnis",
        "reason": "Grund",
        "next_step": "Nächster Schritt",
        "sent": "Gesendet",
        "none": "Keine",
        "loading": "Laden...",
        "error": "Ein Fehler ist aufgetreten.",
        "immediately": "sofort",
        "start_time": "Startzeit",
        "reset_timer": "Timer zurücksetzen",
        "antispam": "Bitte warten Sie, bevor Sie es erneut versuchen."
    },
    "support": {
        "paused_reason": "Die Sprachwarteschlange ist derzeit angehalten.",
        "queue_log": {
            "title": "Support-Warteschlange",
            "description": "{vip_text}Ein Benutzer wartet auf Unterstützung.",
            "color": "#f1c40f"
        },
        "staffLog": {
            "title": "Support-Sitzung",
            "description": "Benutzer **{user}** hat den Support eingegeben.",
            "color": "#f1c40f"
        }
    },
    "tempvoice": {
        "not_manageable": {
            "title": "Sprachkanal nicht verwaltet",
            "description": "Dieser temporäre Sprachkanal wird nicht von Verix verwaltet.",
            "color": "#e74c3c"
        },
        "not_owner": {
            "title": "Kein Kanalbesitzer",
            "description": "Nur der temporäre Kanalbesitzer kann dieses Steuerelement verwenden.",
            "color": "#e74c3c"
        },
        "lock_success": {
            "title": "Kanal gesperrt",
            "description": "Ihr temporärer Sprachkanal wurde gesperrt.",
            "color": "#2ecc71"
        },
        "unlock_success": {
            "title": "Kanal freigeschaltet",
            "description": "Ihr temporärer Sprachkanal wurde entsperrt.",
            "color": "#2ecc71"
        },
        "limit_update": {
            "title": "Benutzerlimit aktualisiert",
            "description": "Das Benutzerlimit ist jetzt auf **{limit}** gesetzt.",
            "color": "#2ecc71"
        },
        "rename_success": {
            "title": "Kanal umbenannt",
            "description": "Der Kanalname wurde auf **{name}** aktualisiert.",
            "color": "#2ecc71"
        }
    }
};
