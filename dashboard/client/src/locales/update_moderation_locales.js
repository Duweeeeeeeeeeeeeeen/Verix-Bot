import fs from 'fs';

const newKeysIT = {
    "moderation.tab_safety": "Sicurezza",
    "moderation.tab_antiraid": "Anti-Raid",
    "moderation.tab_settings": "Impostazioni",
    "moderation.antilink_title": "Anti-Link (Siti Web)",
    "moderation.whitelist_domains": "Domini Consentiti (Whitelist)",
    "moderation.allow_roles": "Ruoli Esentati",
    "moderation.allow_channels": "Canali Esentati",
    "moderation.antiinvite_title": "Anti-Invite (Discord)",
    "moderation.antieveryone_title": "Anti-Everyone/Here",
    "moderation.ghostping_title": "Ghost Ping Detection",
    "moderation.log_in_channel": "Invia log nel canale di moderazione",
    "moderation.antiflood_title": "Anti-Flood / Walltext",
    "moderation.max_lines": "Linee Massime",
    "moderation.max_chars": "Caratteri Massimi",
    "moderation.max_emojis": "Emoji Massime",
    "moderation.antiraid_title": "Anti-Raid / Auto-Quarantine",
    "moderation.joins_threshold": "Soglia Join",
    "moderation.joins_threshold_help": "Numero di utenti che entrano nel lasso di tempo.",
    "moderation.interval_ms": "Intervallo (ms)",
    "moderation.interval_ms_help": "Tempo in millisecondi per monitorare i join.",
    "moderation.raid_action": "Azione Anti-Raid",
    "moderation.action_notify": "Solo Notifica Staff",
    "moderation.action_lockdown": "Lockdown Canali",
    "moderation.action_quarantine": "Ruolo Quarantena",
    "moderation.quarantine_role": "Seleziona Ruolo Quarantena",
    "moderation.lockdown_channels": "Canali da Bloccare",
    "moderation.action_delete": "Elimina Messaggio",
    "moderation.action_warn": "Avverti Utente",
    "moderation.action_none": "Solo Log",
    "moderation.ignored_title": "Eccezioni Globali",
    "moderation.ignored_roles": "Ruoli Ignorati",
    "moderation.ignored_roles_help": "Il bot non filtrerà i messaggi di questi ruoli.",
    "moderation.ignored_channels": "Canali Ignorati",
    "moderation.ignored_channels_help": "Il bot non agirà in questi canali.",
    "moderation.global_config": "Configurazione Globale",
    "moderation.reset_time": "Tempo Reset Infrazioni (Giorni)",
    "moderation.reset_time_help": "Le infrazioni scadono dopo questo tempo.",
    "moderation.save_success": "Configurazione moderazione salvata!",
    "moderation.save_error": "Errore nel salvataggio della configurazione."
};

const newKeysEN = {
    "moderation.tab_safety": "Safety",
    "moderation.tab_antiraid": "Anti-Raid",
    "moderation.tab_settings": "Settings",
    "moderation.antilink_title": "Anti-Link (Websites)",
    "moderation.whitelist_domains": "Allowed Domains (Whitelist)",
    "moderation.allow_roles": "Exempted Roles",
    "moderation.allow_channels": "Exempted Channels",
    "moderation.antiinvite_title": "Anti-Invite (Discord)",
    "moderation.antieveryone_title": "Anti-Everyone/Here",
    "moderation.ghostping_title": "Ghost Ping Detection",
    "moderation.log_in_channel": "Send log in moderation channel",
    "moderation.antiflood_title": "Anti-Flood / Walltext",
    "moderation.max_lines": "Max Lines",
    "moderation.max_chars": "Max Characters",
    "moderation.max_emojis": "Max Emojis",
    "moderation.antiraid_title": "Anti-Raid / Auto-Quarantine",
    "moderation.joins_threshold": "Joins Threshold",
    "moderation.joins_threshold_help": "Number of users joining in the time window.",
    "moderation.interval_ms": "Interval (ms)",
    "moderation.interval_ms_help": "Time in milliseconds to monitor joins.",
    "moderation.raid_action": "Anti-Raid Action",
    "moderation.action_notify": "Staff Notify Only",
    "moderation.action_lockdown": "Channel Lockdown",
    "moderation.action_quarantine": "Quarantine Role",
    "moderation.quarantine_role": "Select Quarantine Role",
    "moderation.lockdown_channels": "Channels to Lockdown",
    "moderation.action_delete": "Delete Message",
    "moderation.action_warn": "Warn User",
    "moderation.action_none": "Log Only",
    "moderation.ignored_title": "Global Exceptions",
    "moderation.ignored_roles": "Ignored Roles",
    "moderation.ignored_roles_help": "The bot will not filter messages from these roles.",
    "moderation.ignored_channels": "Ignored Channels",
    "moderation.ignored_channels_help": "The bot will not act in these channels.",
    "moderation.global_config": "Global Configuration",
    "moderation.reset_time": "Infraction Reset Time (Days)",
    "moderation.reset_time_help": "Infractions expire after this time.",
    "moderation.save_success": "Moderation configuration saved!",
    "moderation.save_error": "Error saving configuration."
};

function updateJson(path, keys) {
    const content = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(content);
    Object.assign(json, keys);
    fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Updated ${path}`);
}

updateJson('it.json', newKeysIT);
updateJson('en.json', newKeysEN);
