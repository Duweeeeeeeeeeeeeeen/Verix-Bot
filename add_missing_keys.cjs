// Script to add missing keys to all locale files
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'dashboard', 'client', 'src', 'locales');

// Missing keys with translations for all languages
const missingKeys = {
  en: {
    "status_page.title": "System Status",
    "status_page.all_operational": "All Systems Operational",
    "status_page.api_latency": "API Latency",
    "status_page.back_to_dashboard": "Back to Dashboard",
    "status_page.checking": "Checking...",
    "status_page.connected": "Connected",
    "status_page.database": "Database",
    "status_page.degraded_performance": "Degraded Performance",
    "status_page.disconnected": "Disconnected",
    "status_page.discord_api": "Discord API",
    "status_page.last_update": "Last Update",
    "status_page.major_outage": "Major Outage",
    "status_page.memory_usage": "Memory Usage",
    "status_page.operational": "Operational",
    "status_page.refresh_desc": "Page refreshes automatically every 30 seconds.",
    "status_page.uptime": "Uptime",
    "common.saved_success": "Saved successfully!",
    "embeds.editor.field_name_placeholder": "Field name..."
  },
  it: {
    "status_page.title": "Stato del Sistema",
    "status_page.all_operational": "Tutti i Sistemi Operativi",
    "status_page.api_latency": "Latenza API",
    "status_page.back_to_dashboard": "Torna alla Dashboard",
    "status_page.checking": "Controllo in corso...",
    "status_page.connected": "Connesso",
    "status_page.database": "Database",
    "status_page.degraded_performance": "Prestazioni Degradate",
    "status_page.disconnected": "Disconnesso",
    "status_page.discord_api": "API di Discord",
    "status_page.last_update": "Ultimo Aggiornamento",
    "status_page.major_outage": "Interruzione Grave",
    "status_page.memory_usage": "Utilizzo Memoria",
    "status_page.operational": "Operativo",
    "status_page.refresh_desc": "La pagina si aggiorna automaticamente ogni 30 secondi.",
    "status_page.uptime": "Uptime",
    "common.saved_success": "Salvato con successo!",
    "embeds.editor.field_name_placeholder": "Nome del campo..."
  },
  es: {
    "status_page.title": "Estado del Sistema",
    "status_page.all_operational": "Todos los Sistemas Operativos",
    "status_page.api_latency": "Latencia de la API",
    "status_page.back_to_dashboard": "Volver al Panel",
    "status_page.checking": "Comprobando...",
    "status_page.connected": "Conectado",
    "status_page.database": "Base de Datos",
    "status_page.degraded_performance": "Rendimiento Degradado",
    "status_page.disconnected": "Desconectado",
    "status_page.discord_api": "API de Discord",
    "status_page.last_update": "Última Actualización",
    "status_page.major_outage": "Interrupción Mayor",
    "status_page.memory_usage": "Uso de Memoria",
    "status_page.operational": "Operativo",
    "status_page.refresh_desc": "La página se actualiza automáticamente cada 30 segundos.",
    "status_page.uptime": "Tiempo de Actividad",
    "common.saved_success": "¡Guardado con éxito!",
    "embeds.editor.field_name_placeholder": "Nombre del campo..."
  },
  fr: {
    "status_page.title": "État du Système",
    "status_page.all_operational": "Tous les Systèmes Opérationnels",
    "status_page.api_latency": "Latence de l'API",
    "status_page.back_to_dashboard": "Retour au Tableau de Bord",
    "status_page.checking": "Vérification...",
    "status_page.connected": "Connecté",
    "status_page.database": "Base de Données",
    "status_page.degraded_performance": "Performances Dégradées",
    "status_page.disconnected": "Déconnecté",
    "status_page.discord_api": "API Discord",
    "status_page.last_update": "Dernière Mise à Jour",
    "status_page.major_outage": "Panne Majeure",
    "status_page.memory_usage": "Utilisation de la Mémoire",
    "status_page.operational": "Opérationnel",
    "status_page.refresh_desc": "La page se rafraîchit automatiquement toutes les 30 secondes.",
    "status_page.uptime": "Disponibilité",
    "common.saved_success": "Enregistré avec succès !",
    "embeds.editor.field_name_placeholder": "Nom du champ..."
  }
};

['en', 'it', 'es', 'fr'].forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const keysToAdd = missingKeys[lang];
  let added = 0;
  for (const [key, value] of Object.entries(keysToAdd)) {
    if (!data[key]) {
      data[key] = value;
      added++;
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`[${lang}] Added ${added} missing keys.`);
});

console.log('Done!');
