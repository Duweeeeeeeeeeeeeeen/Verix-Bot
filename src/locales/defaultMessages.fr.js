/**
 * Default Professional Messages for all modules (English).
 * These are used as standard for every server if no override is found in DB.
 */
export default {
    system: {
        no_permission: {
            title: '⚠️ Accès Refusé',
            description: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette opération. Contactez un administrateur si vous pensez qu\'il s\'agit d\'une erreur.',
            color: '#e74c3c'
        },
        module_disabled: {
            title: '📡 Module Désactivé',
            description: 'Le module **{module}** est actuellement désactivé sur ce serveur. Contactez le staff pour plus d\'informations.',
            color: '#f1c40f'
        },
        role_hierarchy: {
            title: '⚖️ Hiérarchie des Rôles',
            description: 'Impossible d\'attribuer le rôle **{role}**. Le bot ne peut pas gérer de rôles supérieurs ou égaux au sien dans la hiérarchie du serveur.',
            color: '#e74c3c'
        },
        generic_error: {
            title: '❌ Erreur Système',
            description: 'Une erreur inattendue s\'est produite lors du traitement. Les techniciens ont été informés.',
            color: '#e74c3c'
        },
        setup_success: {
            title: '✅ Configuration Terminée',
            description: 'Le module a été correctement configuré et est maintenant opérationnel.',
            color: '#2ecc71'
        },
        module_list: {
            title: '⚙️ Gestion des Modules',
            description: 'Liste des modules actuellement chargés dans le système:\n\n{list}',
            color: '#5865f2'
        },
        module_enabled: {
            title: '✅ Module Activé',
            description: 'Le module **{module}** a été activé avec succès.',
            color: '#2ecc71'
        },
        module_disabled_success: {
            title: '❌ Module Désactivé',
            description: 'Le module **{module}** a été retiré du système. Toutes les fonctions associées sont suspendues.',
            color: '#e74c3c'
        },
        module_already_in_state: {
            title: 'ℹ️ État Inchangé',
            description: 'Le module **{module}** est déjà dans l\'état demandé.',
            color: '#3498db'
        },
        module_not_found: {
            title: '❌ Module Introuvable',
            description: 'Le module **{module}** n\'est pas enregistré dans le système.',
            color: '#e74c3c'
        }
    },
    utility: {
        clear_success: {
            title: '🧹 Nettoyage du Chat',
            description: '**{amount}** messages ont été supprimés avec succès.',
            color: '#2ecc71'
        },
        clear_no_messages: {
            title: '⚠️ Aucun Message',
            description: 'Aucun message correspondant aux critères de suppression n\'a été trouvé.',
            color: '#f1c40f'
        },
        clear_error: {
            title: '❌ Erreur de Nettoyage',
            description: 'Une erreur s\'est produite lors de la suppression. Note: les messages datant de plus de 14 jours ne peuvent pas être supprimés en masse.',
            color: '#e74c3c'
        },
        ping: {
            title: '🏓 État de la Connexion',
            description: '>>> **Latence:**\n• Bot: `{latency}ms`\n• API: `{api_latency}ms`',
            color: '#3498db'
        }
    },
    whitelist: {
        panel: {
            title: '📋 Système de Candidature',
            description: 'Bienvenue sur le portail d\'accès. Pour obtenir un accès complet ou demander un rôle spécifique, vous devez remplir le formulaire de candidature.\n\nAssurez-vous de répondre honnêtement aux questions qui vous sont présentées.',
            color: '#3BA4FF',
            footer: 'Gestion des Candidatures | {guild}'
        },
        start: {
            title: '📄 Nouvelle Candidature : {user_name}',
            description: 'Bienvenue. Pour donner suite à votre demande, nous devons recueillir certaines informations nécessaires à l\'évaluation.\n\n**INSTRUCTIONS :**\n• Répondez honnêtement et avec beaucoup de détails.\n• Respectez les protocoles de temps pour éviter l\'annulation de la session.',
            color: '#3BA4FF',
            footer: 'Bureau d\'Évaluation | {guild}'
        },
        question: {
            title: '❓ Question : {current_index} sur {total_questions}',
            description: '>>> {question}',
            color: '#3BA4FF'
        },
        review: {
            title: '📋 Examen Final',
            description: 'Révisez attentivement vos déclarations. Une fois confirmée, votre candidature sera transmise au staff pour le verdict final.',
            color: '#2ecc71'
        },
        not_configured: {
            title: '⏳ Configuration Incomplète',
            description: 'La procédure de candidature n\'a pas encore été finalisée par le staff. Veuillez réessayer plus tard.',
            color: '#f1c40f'
        },
        active_session: {
            title: '📄 Session en Cours',
            description: 'Il y a déjà une session de candidature ouverte à votre nom dans le salon <#{channelId}>. Terminez cette procédure avant d\'en commencer une nouvelle.',
            color: '#3498db'
        },
        already_submitted: {
            title: '📂 En Cours d\'Évaluation',
            description: 'Votre documentation a déjà été livrée et est actuellement sur le bureau du staff. Vous recevrez un résultat sous peu.',
            color: '#3498db'
        },
        already_passed: {
            title: '✅ Accès Déjà Obtenu',
            description: 'Nos dossiers indiquent que vous êtes déjà un membre approuvé de **{guild}**. Il n\'est pas nécessaire de répéter la procédure.',
            color: '#2ecc71'
        },
        cooldown: {
            title: '⚠️ Période d\'Attente',
            description: 'Votre dernière demande a été récemment rejetée. Pour des raisons organisationnelles, vous devez attendre **{time}** avant de soumettre une nouvelle candidature.',
            color: '#e74c3c'
        },
        start_success: {
            title: '✅ Session Démarrée',
            description: 'Votre candidature a été correctement ouverte. Rendez-vous dans le salon <#{channelId}> pour commencer à fournir vos informations.',
            color: '#2ecc71'
        },
        session_completed: {
            title: '📝 Entretien Transcrit',
            description: 'Vous avez répondu à toutes les questions de l\'entretien. Le staff analysera votre candidature sous peu.\n\nVérifiez vos réponses ci-dessus et utilisez les boutons pour confirmer ou annuler l\'envoi.',
            color: '#3498db'
        },
        min_length_error: {
            title: '⚠️ Détails Insuffisants',
            description: 'Votre réponse doit contenir au moins **{minLength}** caractères pour être considérée comme valide. Veuillez essayer de mieux vous expliquer.',
            color: '#f1c40f'
        },
        dm_accepted: {
            title: '✅ Aptitude Confirmée',
            description: 'Félicitations citoyen ! Votre candidature à **{guild}** a été approuvée par la Commission.\n\nVous pouvez maintenant accéder aux canaux officiels et commencer votre expérience.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Résultat Négatif',
            description: 'Désolé, mais l\'évaluation de votre dossier chez **{guild}** n\'a pas été positive.\n\n**RAISON :**\n{reason}\n\nVous pourrez essayer de soumettre une nouvelle demande après la période d\'attente.',
            color: '#e74c3c'
        },
        dm_voice_rejected: {
            title: '⚠️ Protocole Oral Rejeté',
            description: 'Vous n\'avez pas réussi l\'évaluation orale chez **{guild}**. Nous vous invitons à revoir les protocoles de la ville avant de postuler à nouveau.',
            color: '#e74c3c'
        },
        dm_text_pass: {
            title: '📝 Test Écrit Réussi',
            description: 'Vous avez réussi le test écrit sur **{guild}** ! Vous pouvez maintenant vous rendre dans le salon vocal d\'attente pour l\'entretien final.',
            color: '#f1c40f'
        },
        staff_received: {
            title: '📩 Nouvelle Candidature (Whitelist)',
            description: 'L\'utilisateur **{user_name}** a soumis son dossier pour évaluation.\n\n**INFO :**\n• Discord : <@{user_id}>\n• ID Candidature : `{app_id}`',
            color: '#3498db'
        },
        dm_submitted: {
            title: '📋 Dossier Reçu',
            description: 'Votre candidature pour entrer dans **{guild}** a été acquise par nos systèmes.\n\nUn membre de la Commission l\'examinera dès que possible. Vous serez informé ici dès qu\'il y aura un résultat.',
            color: '#3498db'
        },
        submission_confirmed: {
            title: '✅ Dossier Envoyé',
            description: 'Votre documentation a été correctement envoyée aux bureaux compétents. Vous serez informé du résultat sous peu.',
            color: '#2ecc71'
        },
        voice_procedural_error: {
            title: '❌ Erreur de Procédure',
            description: 'Désolé citoyen, mais l\'État ne prévoit pas d\'entretiens oraux pour le type de visa que vous avez demandé.',
            color: '#e74c3c'
        },
        queue_log: {
            title: '📢 Protocole de File : Nouvelle Entrée',
            description: 'Un nouveau citoyen attend un entretien.\n\n**SUJET :** {user}\n**ID :** `{user_id}`\n**FILE ACTUELLE :** `{waiting_count}`',
            color: '#3498db'
        },
        next_step_written: 'La prochaine étape consiste à remplir le Test Écrit. Dès que vous êtes prêt, cliquez sur le bouton ci-dessous.',
        next_step_voice: 'La prochaine étape consiste à remplir le Test Vocal. Veuillez patienter pendant qu\'un membre du staff vous rejoint.',
        written_finish: 'Votre procédure de whitelist est terminée.',
        start_written: 'Commencer le Test Écrit',
        bg_story_title: 'Histoire du Personnage de {user}',
        written_archive_title: 'Réponses Écrites de {user}',
        bg_link_label: 'Lien du Background',
        bg_link_value: '[Ouvrir le Document]({link})'
    },
    background: {
        panel: {
            title: '📜 Archive Historique : Dépôt de l\'Histoire du Personnage',
            description: 'Commencez à rédiger l\'histoire de votre personnage pour obtenir l\'approbation finale de votre historique.\n\nCliquez sur le bouton ci-dessous pour lancer le protocole de dépôt.',
            color: '#5865f2',
            footer: 'Bureau d\'Enregistrement | {guild}'
        },
        instructions: {
            title: '✍️ Rédaction de l\'Histoire du Personnage',
            description: 'Vous commencez à rédiger votre histoire. Assurez-vous de décrire avec précision les origines et les ambitions de votre personnage.\n\n**EXIGENCES :**\n• Cohérence avec le cadre de la ville.\n• Respect des directives narratives.',
            color: '#3498db'
        },
        modal_title: 'Détails de l\'Histoire',
        link_label: 'Lien vers l\'Histoire (ex. Google Doc)',
        desc_label: 'Brève Description (Optionnel)',
        desc_placeholder: 'Résumez l\'histoire de votre personnage ici...',
        dm_accepted: {
            title: '📜 Histoire Approuvée',
            description: 'Votre histoire a été officiellement déposée dans les archives de **{guild}**. Votre personnage fait désormais partie intégrante de la ville.',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '⚠️ Révision Demandée',
            description: 'Votre proposition d\'histoire pour **{guild}** a été rejetée ou nécessite des révisions.\n\n**NOTES DU STAFF :**\n{reason}',
            color: '#e74c3c'
        },
        staff_received: {
            title: '📖 Nouvelle Histoire Reçue',
            description: 'Un utilisateur a soumis une histoire pour révision.\n\n**Utilisateur :** <@{userId}>\n**Lien :** [Ouvrir le Document]({bg_link})\n**Description :** {bg_desc}\n**ID :** `{app_id}`',
            color: '#3498db'
        },
        approve_btn: 'Approuver',
        deny_btn: 'Rejeter',
        accepted_title: '✅ Histoire APPROUVÉE',
        rejected_title: '❌ Histoire REJETÉE',
        staff_tag: '👮 Membre du Staff',
        subject_tag: '👤 Sujet',
        outcome_tag: 'Résultat du Staff'
    },
    staffapps: {
        panel: {
            title: '📝 Portail de Candidature',
            description: 'Voulez-vous soumettre une candidature ? Cliquez sur le bouton ci-dessous pour commencer.\n\nAssurez-vous de répondre à toutes les questions de manière exhaustive.',
            color: '#a855f7',
            footer: 'Portail de Candidature | {guild}'
        },
        dm_accepted: {
            title: '🎊 Candidature Acceptée !',
            description: 'Excellente nouvelle {user} ! Votre candidature pour {guild} a été approuvée !',
            color: '#2ecc71'
        },
        dm_rejected: {
            title: '❌ Candidature Rejetée',
            description: 'Nous sommes désolés {user}, mais votre candidature pour {guild} n\'a pas été approuvée.\n\n**Raison:**\n>>> {reason}',
            color: '#ff4757'
        },
        staff_received: {
            title: '📩 Nouvelle Candidature Reçue',
            description: 'L\'utilisateur **<@{userId}>** a soumis une nouvelle candidature.',
            color: '#a855f7'
        }
    },
    tickets: {
        panel: {
            title: '🎫 Centre de Support',
            description: 'Besoin d\'aide ou vous voulez signaler un problème ? Ouvrez un ticket de support en sélectionnant la bonne catégorie dans le menu ci-dessous.',
            color: '#2ECC71',
            footer: 'Équipe de Support | {guild}'
        },
        ticket: {
            title: '📂 Ticket de Support : {type}',
            description: 'Bienvenue, <@{user_id}>. Un membre du staff s\'occupera de votre demande sous peu.',
            color: '#2ECC71'
        },
        success_open: {
            title: '✅ Ticket Créé',
            description: 'Votre ticket a été ouvert avec succès.\n\n**Salon :** {channel}',
            color: '#2ecc71'
        },
        created_success: {
            title: '✅ Ticket Créé',
            description: 'Votre ticket a été ouvert avec succès dans <#{channelId}>.',
            color: '#2ecc71'
        },
        close: {
            title: '🔒 Ticket Fermé',
            description: 'Ce ticket a été correctement fermé et archivé.',
            color: '#E74C3C'
        },
        close_started: {
            title: '🔒 Fermeture en Cours',
            description: 'Le ticket est en cours de fermeture et d\'archivage. Veuillez patienter...',
            color: '#e67e22'
        },
        already_exists: {
            title: '⚠️ Ticket Existant',
            description: 'Vous avez déjà un ticket ouvert de type **{type}** dans le salon <#{channelId}>.',
            color: '#f1c40f'
        },
        staff_claimed: {
            title: '⚙️ Réclamé',
            description: 'Le membre du staff **{staff}** a pris en charge votre ticket et vous assistera sous peu.',
            color: '#3498db'
        },
        claim_already: {
            title: '⚠️ Déjà Réclamé',
            description: 'Ce ticket a déjà été réclamé par <@{staffId}>.',
            color: '#f1c40f'
        },
        status_updated: {
            title: '🔄 Statut Mis à Jour',
            description: 'Le statut du ticket a été défini sur : **{status}**.',
            color: '#3498db'
        },
        inactivity_close: {
            title: '⚠️ Fermé pour Inactivité',
            description: 'Ce ticket a été automatiquement fermé en raison d\'un manque d\'activité récente.',
            color: '#e74c3c'
        },
        default_welcome: {
            title: '🎫 Demande d\'Assistance',
            description: 'Bienvenue au centre de support. Un membre du staff sera là sous peu.\n\nRaison : **{reason}**',
            color: '#5865F2'
        },
        priority_select: {
            title: '⚡ Sélection de la Priorité',
            description: 'Veuillez sélectionner le niveau de priorité pour ce ticket avant de continuer.',
            color: '#f1c40f'
        },
        quick_reply_menu: {
            title: '📝 Réponses Rapides',
            description: 'Sélectionnez un modèle de réponse à envoyer dans le ticket.',
            color: '#3498db'
        },
        tag_menu: {
            title: '🏷️ Gestion des Tags',
            description: 'Sélectionnez un tag à ajouter ou retirer de ce ticket.',
            color: '#3498db'
        },
        staff_only: {
            title: '⚠️ Accès Restreint',
            description: 'Désolé, mais seuls les membres du staff peuvent utiliser ces fonctionnalités de gestion.',
            color: '#e74c3c'
        },
        blacklist_error: {
            title: '🚫 Accès Refusé',
            description: 'Votre compte a été mis sur liste noire du système de tickets. Vous ne pouvez pas ouvrir de nouvelles demandes.',
            color: '#e74c3c'
        },
        note_success: {
            title: '✅ Note Ajoutée',
            description: 'La note interne a été enregistrée avec succès dans la base de données du ticket.',
            color: '#2ecc71'
        },
        config_not_found: {
            title: '❌ Configuration Manquante',
            description: 'Le système de tickets n\'a pas encore été configuré pour ce serveur. Contactez les administrateurs.',
            color: '#e74c3c'
        },
        category_not_available: {
            title: '❌ Catégorie Non Disponible',
            description: 'La catégorie sélectionnée n\'est plus disponible ou a été supprimée par le staff.',
            color: '#e74c3c'
        },
        staff_ticket_log: {
            title: '📂 Journal des Tickets Fermés',
            description: '>>> **Utilisateur:** {user}\n**Type:** `{type}`\n**Staff:** {staff}',
            color: '#3498db'
        },
        intelligence: {
            title: '🔍 Renseignement : {user}',
            prev_tickets: '🎫 Tickets Précédents',
            sessions_closed: '`{count}` sessions fermées',
            whitelist: '📋 Whitelist',
            status: 'Statut : `{status}`',
            no_app: 'Pas de candidature',
            last_wl: '📅 Dernière Whitelist',
            background: '📖 Histoire',
            no_dossier: 'Pas de dossiers',
            footer: 'Module de Renseignement Staff',
            field_name: '🔍 Renseignement Utilisateur'
        },
        system_messages: {
            priority_placeholder: 'Sélectionnez la priorité...',
            priority_normal: 'Normale',
            priority_important: 'Importante',
            priority_urgent: 'Urgente',
            claim_btn: 'Réclamer',
            close_btn: 'Fermer',
            quick_reply_btn: 'Réponses Rapides',
            note_btn: 'Note',
            status_placeholder: 'Changer le statut...',
            status_processing: 'En Traitement',
            status_waiting: 'En Attente (Utilisateur)',
            note_modal_title: 'Ajouter une Note Interne',
            note_input_label: 'Contenu de la note',
            note_input_placeholder: 'Écrivez une note visible uniquement par le staff...',
            report_modal_title: 'Formulaire de Signalement',
            report_subject_label: 'Sujet',
            report_desc_label: 'Description',
            no_quick_replies: '❌ Aucune réponse rapide configurée.',
            quick_reply_placeholder: 'Choisissez un modèle...',
            tag_placeholder: 'Sélectionnez un tag...',
            claim_success: '✅ Ticket réclamé avec succès.',
            status_updated_msg: '✅ Statut du ticket mis à jour sur : **{status}**',
            assigned_staff_label: '👤 Staff Assigné',
            internal_notes_label: '📝 Notes Internes',
            waiting_staff: '_En attente..._',
            none: '_Aucun_',
            new_ticket_ping: '{ping} - Nouveau ticket **{type}** ouvert.',
            cooldown: '⚠️ **TRAFIC INTENSE:** Attendez quelques minutes avant d\'ouvrir un nouveau ticket.',
            already_exists: '❌ **ERREUR:** Vous avez déjà un ticket **{type}** ouvert.',
            success_open: '✅ **TICKET OUVERT:** Allez au salon {channel}.',
            success_close: '🛡️ **ARCHIVAGE EN COURS...**',
            staff_claimed: '✅ **{staff}** a réclamé le ticket.',
            claim_already: '❌ Ce ticket a déjà été réclamé par <@{staffId}>.',
            staff_only: '⚠️ Accès restreint uniquement aux membres du staff.',
            blacklist_error: '🚫 Vous avez été mis sur liste noire du système de tickets.'
        }
    },
    verify: {
        panel: {
            title: '🛡️ Vérification de Compte',
            description: 'Pour accéder aux salons du serveur, vous devez vérifier votre identité. Cliquez sur le bouton ci-dessous pour continuer.',
            color: '#3BA4FF',
            footer: 'Système de Sécurité | {guild}'
        },
        success: {
            title: '✅ Vérification Terminée',
            description: 'Bienvenue ! Votre vérification sur **{guild}** a réussi. Vous avez maintenant accès à tous les salons.',
            color: '#2ecc71'
        },
        already_verified: {
            title: '⚠️ Déjà Vérifié',
            description: 'Votre identité est déjà vérifiée dans la base de données de **{guild}**.',
            color: '#f1c40f'
        },
        dm: {
            title: '🎊 Bienvenue sur le Serveur',
            description: 'Vous vous êtes vérifié avec succès sur **{guild}**. Profitez de votre séjour et amusez-vous !',
            color: '#2ecc71'
        },
        staff_log: {
            title: '🛂 Journal de Vérification : Nouveau Membre',
            description: 'Un nouvel utilisateur a terminé la vérification.\n\n**Utilisateur :** {user}\n**ID :** `{userId}`',
            color: '#2ecc71'
        },
        role_not_found: {
            title: 'Role de verification manquant',
            description: 'Le role de verification n est plus disponible. Contactez le staff.',
            color: '#e74c3c'
        },

    },
    fivem: {
        status_embed: {
            title: '🏙️ Statut de la Ville : En Ligne',
            description: 'Le cœur de la métropole est actif. Les citoyens sont invités à se connecter et à commencer leur journée.\n\n📡 **Serveur :** `{serverName}`\n👥 **Citoyens en Ville :** `{players}/{maxPlayers}`\n🟢 **Statut :** Opérationnel',
            color: '#2ecc71',
            footer: 'Surveillance Urbaine | Verix RP'
        },
        offline_embed: {
            title: '🔴 Statut de la Ville : Hors Ligne',
            description: 'Attention citoyens. La connexion à la métropole a été interrompue. Les techniciens travaillent pour restaurer les protocoles d\'accès.\n\n⚠️ **Statut :** Inaccessible / Maintenance',
            color: '#e74c3c',
            footer: 'Urgence Urbaine | Verix RP'
        }
    },
    welcome: {
        join: {
            title: '👋 Bienvenue sur le Serveur !',
            description: 'Bonjour **{user}**, bienvenue sur **{guild}** ! Nous sommes heureux de t\'avoir parmi nous.\n\nAssure-toi de lire les règles pour passer un agréable séjour.',
            color: '#2ecc71'
        },
        leave: {
            title: '👋 Au revoir !',
            description: '**{user}** a quitté le serveur. Nous espérons te revoir bientôt !',
            color: '#e74c3c'
        }
    },
    voice: {
        control_panel: {
            title: '🎙️ Panneau de Contrôle Vocal',
            description: 'Bienvenue <@{user}> ! Ceci est ton salon temporaire.\nUtilise les boutons ci-dessous pour le gérer rapidement.',
            color: '#5865F2'
        },
        status_none: 'Aucun',
        owner_field: '👑 Propriétaire',
        limit_field: '👥 Limite'
    },
    moderation: {
        no_reason: 'Aucune raison fournie',
        error: {
            title: '❌ Erreur de Modération',
            description: 'Une erreur s\'est produite lors de l\'exécution de la commande.',
            color: '#e74c3c'
        },
        command_ban: {
            title: '✅ Bannissement Exécuté',
            description: 'L\'utilisateur **{user}** a été banni avec succès.\n\n**Raison :** {reason}',
            color: '#2ecc71'
        },
        warn: {
            title: '🛡️ Avertissement Officiel',
            description: 'Attention **{user}**, tu as reçu un avertissement officiel pour avoir enfreint les règles.\n\n**Raison :**\n>>> {reason}',
            color: '#f1c40f',
            footer: 'Modération | {guild}'
        },
        timeout: {
            title: '🔇 Exclu Temporairement',
            description: 'L\'utilisateur **{user}** a été rendu muet temporairement pendant **{duration}**.\n\n**Raison :**\n>>> {reason}',
            color: '#e67e22'
        },
        kick: {
            title: '👢 Expulsé du Serveur',
            description: 'Tu as été expulsé du serveur pour avoir enfreint les règles.\n\n**Raison :**\n>>> {reason}',
            color: '#e74c3c'
        },
        ban: {
            title: '🚫 Bannissement Permanent',
            description: 'Ton accès à ce serveur a été révoqué de manière permanente.\n\n**Raison :**\n>>> {reason}',
            color: '#000000'
        }
    },
    giveaway: {
        no_participants: {
            title: '😔 Giveaway Terminé',
            description: 'Le giveaway pour **{prize}** s\'est terminé sans aucun participant valide.',
            color: '#e74c3c'
        },
        winners: {
            title: '🎉 Gagnants du Giveaway !',
            description: 'Le giveaway pour **{prize}** est terminé !\n\n🏆 **Gagnants :** {winners}',
            color: '#2ecc71'
        },
        already_ended: {
            title: '⚠️ Giveaway Déjà Terminé',
            description: 'Désolé, ce giveaway est déjà terminé.',
            color: '#f1c40f'
        },
        level_required: {
            title: '🛡️ Condition de Niveau Non Remplie',
            description: 'Tu dois être au moins **Niveau {minLevel}** pour rejoindre ce giveaway !\nTon niveau actuel est **Niveau {currentLevel}**.',
            color: '#e74c3c'
        }
    },
    photocontest: {
        panel: {
            title: '📸 Concours Photo',
            description: 'Participe à notre concours photo ! Télécharge ta meilleure photo en respectant le thème actuel.\n\n**Thème :** `{theme}`\n**Date Limite :** {endTime}',
            color: '#F39C12'
        },
        submission: {
            title: '🎨 Œuvre de {username}',
            description: 'Une nouvelle photo a été téléchargée pour le concours.\n\n**Thème :** `{theme}`\n**Date Limite :** {endTime}',
            color: '#3498db'
        }
    },
    logs: {
        message_deleted: {
            title: '🗑️ Message Supprimé',
            author: 'Auteur',
            channel: 'Salon',
            content: 'Contenu',
            no_text: '*Aucun texte (peut-être un embed ou un fichier)*',
            color: '#e74c3c'
        },
        message_updated: {
            title: '📝 Message Mis à Jour',
            author: 'Auteur',
            channel: 'Salon',
            before: 'Avant',
            after: 'Après',
            color: '#3498db'
        }
    },
    admin: {
        embed_editor: {
            title: '🛠️ Éditeur d\'Embed',
            description: 'Tu édites un message par défaut. Utilise les boutons pour modifier les champs.',
            color: '#F1C40F'
        }
    },
    socials: {
        twitch: {
            title: '📡 **{streamer}** est en direct !',
            description: '### {title}\n\nHé ! **{streamer}** vient d\'allumer la caméra sur Twitch. Ne manque pas l\'émission !\n\n[Rejoindre le Direct]({url})',
            color: '#6441a5',
            footer: 'Notifications Sociales | Verix'
        },
        youtube: {
            title: '🎥 Nouvelle vidéo de **{streamer}** !',
            description: '### {title}\n\nUne nouvelle vidéo vient de sortir sur la chaîne ! Va y jeter un coup d\'œil.',
            color: '#ff0000',
            footer: 'Notifications Sociales | Verix'
        },
        twitter: {
            title: '𝕏 (Twitter) Nouvelle publication de **{streamer}**',
            description: '{description}',
            color: '#000000',
            footer: 'Notifications Sociales | Verix'
        },
        instagram: {
            title: '📸 Nouvelle publication de **{streamer}**',
            description: '### {title}\n\nNouveau contenu téléchargé sur Instagram ! Va jeter un œil.',
            color: '#e1306c',
            footer: 'Notifications Sociales | Verix'
        },
        tiktok: {
            title: '🎵 Nouveau TikTok de **{streamer}**',
            description: '### {title}\n\nUne nouvelle vidéo vient d\'être publiée sur TikTok ! Regarde maintenant.',
            color: '#000000',
            footer: 'Notifications Sociales | Verix'
        },
        reddit: {
            title: '👾 Nouvelle publication sur **r/{username}** !',
            description: '### {title}\n\n**{author}** a publié un nouveau contenu sur **r/{username}** !\n\n{description}',
            color: '#ff4500',
            footer: 'Notifications Sociales | Verix'
        },
        steam: {
            title: '🎮 Nouvelle annonce pour **{username}** !',
            description: '### {title}\n\n**{username}** a partagé une nouvelle annonce ou mise à jour !\n\n{description}',
            color: '#1b2838',
            footer: 'Notifications Sociales | Verix'
        },
        default_titles: {
            Twitch: '📡 **{streamer}** est en direct !',
            YouTube: '🎥 Nouvelle vidéo de **{streamer}** !',
            Twitter: '𝕏 (Twitter) Nouvelle publication de **{streamer}**',
            Instagram: '📸 Nouvelle publication de **{streamer}**',
            TikTok: '🎵 Nouveau TikTok de **{streamer}**',
            Reddit: '👾 Nouvelle publication sur **r/{username}** !',
            Steam: '🎮 Nouvelle annonce pour **{username}** !'
        },
        default_descriptions: {
            Twitch: '### {title}\n\nHé ! **{streamer}** vient d\'allumer la caméra sur Twitch. Ne manque pas l\'émission !\n\n[Rejoindre le Direct]({url})',
            YouTube: '### {title}\n\nUne nouvelle vidéo vient de sortir sur la chaîne ! Va y jeter un coup d\'œil.',
            Twitter: '{description}',
            Instagram: '### {title}\n\nNouveau contenu téléchargé sur Instagram ! Va jeter un œil.',
            TikTok: '### {title}\n\nA une nouvelle vidéo vient d\'être publiée sur TikTok ! Regarde maintenant.',
            Reddit: '### {title}\n\n**{author}** a publié un nouveau contenu sur **r/{username}** !\n\n{description}',
            Steam: '### {title}\n\n**{username}** a partagé une nouvelle annonce ou mise à jour !\n\n{description}'
        },
        button_labels: {
            Twitch: 'Regarder en Direct',
            YouTube: 'Regarder la Vidéo',
            Twitter: 'Voir sur 𝕏',
            X: 'Voir sur 𝕏',
            Instagram: 'Voir sur Instagram',
            TikTok: 'Voir sur TikTok',
            Reddit: 'Voir sur Reddit',
            Steam: 'Voir sur Steam',
            default: 'Ouvrir le Lien'
        },
        footer: 'Notifications Sociales | Verix'
    },
    leveling: {
        disabled: {
            title: '📡 Module Désactivé',
            description: 'Le module **Leveling et Récompenses** est actuellement désactivé sur ce serveur. Contacte le staff pour plus d\'informations.',
            color: '#f1c40f'
        },
        rank: {
            title: '✨ Carte de Rang - {username}',
            level: '📊 Niveau',
            rank: '🏆 Rang',
            xp: '🧪 Progression XP',
            progress: '📈 Progression',
            messages: '💬 Total de Messages',
            daily_limit: '📅 Limite Quotidienne',
            color: '#5865f2'
        },
        leaderboard: {
            title: '🏆 Classement du Serveur',
            empty_title: '⚠️ Classement Vide',
            empty_desc: 'Le classement est actuellement vide. Commence à envoyer des messages pour gagner de l\'XP !',
            entry: '{pos} <@{userId}> • **Niv {level}** ({xp} XP)',
            footer: 'Ton Rang : {rank} | Communauté Active',
            unranked: 'Non classé',
            color: '#5865f2'
        }
    },
    poll: {
        ended: { title: 'Sondage ferm?', description: 'Ce sondage est d?j? termin?.', color: '#f1c40f' },
        invalid_option: { title: 'Option invalide', description: 'Cette option du sondage n?est plus disponible.', color: '#e74c3c' },
        vote_removed: { title: 'Vote retir?', description: 'Votre vote a bien ?t? retir?.', color: '#2ecc71' },
        vote_recorded: { title: 'Vote enregistr?', description: 'Votre vote a bien ?t? enregistr?.', color: '#2ecc71' }
    },
    reactionroles: {
        role_not_found: { title: 'Role introuvable', description: 'Le role configure n existe plus. Contactez un administrateur.', color: '#e74c3c' },
        role_removed: { title: 'R?le retir?', description: 'R?le **{role}** retir? avec succ?s.', color: '#2ecc71' },
        role_assigned: { title: 'R?le attribu?', description: 'R?le **{role}** attribu? avec succ?s.', color: '#2ecc71' },
        update_error: { title: 'Echec de mise a jour du role', description: 'Impossible de mettre a jour le role. Verifiez les permissions du bot et la hierarchie des roles.', color: '#e74c3c' }
    },
    common: {
        no_reason: 'Aucune raison fournie',
        none: 'Aucun',
        loading: 'Chargement...',
        error: 'Une erreur s\'est produite.',
        immediately: 'immédiatement',
        start_time: 'Heure de Début'
    }
};
