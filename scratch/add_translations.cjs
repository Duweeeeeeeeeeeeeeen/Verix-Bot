const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, '..', 'dashboard', 'client', 'src', 'locales');

const enFile = path.join(localesPath, 'en.json');
const itFile = path.join(localesPath, 'it.json');

const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const it = JSON.parse(fs.readFileSync(itFile, 'utf8'));

// Keys to add
const newItKeys = {
    "dashboard.module_whitelist_desc_v2": "Gestione avanzata degli accessi e selezioni automatizzate per il tuo server.",
    "dashboard.module_tickets_desc_v2": "Sistema completo di assistenza per gestire i tuoi utenti con efficienza.",
    "dashboard.module_reactionroles_desc_v2": "Permetti ai tuoi utenti di auto-assegnarsi i ruoli tramite comode reazioni.",
    "dashboard.module_polls_desc_v2": "Crea sondaggi interattivi e avanzati per coinvolgere la tua community.",
    "dashboard.module_verify_desc_v2": "Massima protezione contro i raid e sistemi di verifica bot intelligenti.",
    "dashboard.module_photocontest_desc_v2": "Organizza contest fotografici entusiasmanti con votazioni in tempo reale.",
    "dashboard.module_support_desc_v2": "Canali vocali di emergenza per un supporto immediato ai tuoi utenti.",
    "dashboard.module_fivem_desc_v2": "Collega il tuo server Discord al tuo server FiveM per una sincronizzazione perfetta.",
    "dashboard.module_welcome_desc_v2": "Crea un'esperienza di benvenuto unica con messaggi e ruoli automatici.",
    "hub.open_tickets": "Ticket Aperti",
    "hub.whitelist_req": "Richieste Whitelist",
    "hub.sos_sessions": "Sessioni Vocali SOS",
    "hub.week_trend": "questa sett.",
    "hub.pending_review": "In attesa di revisione",
    "hub.sos_active": "Utenti in coda",
    "hub.operational_modules": "Moduli Operativi",
    "hub.active_caps": "ATTIVI",
    "hub.module_status_on": "ON",
    "hub.module_status_off": "OFF",
    "hub.command_center": "Centro di Comando",
    "hub.nav_embeds": "Progetta messaggi",
    "hub.nav_automations": "Auto-Clear & Broadcast",
    "hub.nav_whitelabel": "Branding Personalizzato",
    "hub.nav_audit": "Log delle attività",
    "hub.nav_global": "Configurazione base"
};

const newEnKeys = {
    "dashboard.module_whitelist_desc_v2": "Advanced access management and automated selections for your server.",
    "dashboard.module_tickets_desc_v2": "Complete support system to manage your users efficiently.",
    "dashboard.module_reactionroles_desc_v2": "Allow users to self-assign roles via convenient reactions.",
    "dashboard.module_polls_desc_v2": "Create interactive and advanced polls to engage your community.",
    "dashboard.module_verify_desc_v2": "Maximum protection against raids and intelligent bot verification systems.",
    "dashboard.module_photocontest_desc_v2": "Organize exciting photo contests with real-time voting.",
    "dashboard.module_support_desc_v2": "Emergency voice channels for immediate support to your users.",
    "dashboard.module_fivem_desc_v2": "Link your Discord server to your FiveM server for perfect synchronization.",
    "dashboard.module_welcome_desc_v2": "Create a unique welcome experience with automated messages and roles.",
    "hub.open_tickets": "Open Tickets",
    "hub.whitelist_req": "Whitelist Requests",
    "hub.sos_sessions": "SOS Voice Sessions",
    "hub.week_trend": "this week",
    "hub.pending_review": "Pending review",
    "hub.sos_active": "Users in queue",
    "hub.operational_modules": "Operational Modules",
    "hub.active_caps": "ACTIVE",
    "hub.module_status_on": "ON",
    "hub.module_status_off": "OFF",
    "hub.command_center": "Command Center",
    "hub.nav_embeds": "Design messages",
    "hub.nav_automations": "Auto-Clear & Broadcast",
    "hub.nav_whitelabel": "Custom Branding",
    "hub.nav_audit": "Activity Logs",
    "hub.nav_global": "Basic configuration"
};

Object.assign(it, newItKeys);
Object.assign(en, newEnKeys);

// Sort alphabetically to maintain order (optional, but good practice if it was sorted)
const sortObj = obj => Object.keys(obj).sort().reduce((acc, key) => {
  acc[key] = obj[key];
  return acc;
}, {});

fs.writeFileSync(itFile, JSON.stringify(sortObj(it), null, 2));
fs.writeFileSync(enFile, JSON.stringify(sortObj(en), null, 2));

console.log("Translations added.");
