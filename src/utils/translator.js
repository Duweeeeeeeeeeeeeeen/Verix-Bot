import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica in memoria i file al momento del boot (così non usiamo fs ad ogni azione sul discord bot)
const localesBase = path.join(__dirname, '../locales');
const locales = {
    it: {},
    en: {}
};

try {
    const itFile = fs.readFileSync(path.join(localesBase, 'it.json'), 'utf8');
    const enFile = fs.readFileSync(path.join(localesBase, 'en.json'), 'utf8');
    
    locales.it = JSON.parse(itFile);
    locales.en = JSON.parse(enFile);
    logger.info('[I18N] Translation files loaded successfully');
} catch (error) {
    logger.error('[I18N] Critical error loading translation files:', error);
}

/**
 * Funzione principale per estrarre la stringa localizzata
 * @param {string} lang 'it' o 'en' (default 'it')
 * @param {string} key La chiave JSON (es. 'verify.success')
 * @param {object} variables Oggetto contenente le key delle variabili ({ user: '<@123>' })
 * @returns {string} Stringa tradotta, o la chiave se non esiste
 */
export function t(lang = 'en', key, variables = {}) {
    // 1. Cerca nella lingua richiesta
    // 2. Altrimenti usa l'inglese come safe fallback globale
    // 3. Fallback sulla chiave stessa
    let text = locales[lang]?.[key] || locales['en']?.[key] || key;
    
    if (typeof text !== 'string') return text;

    // Sostituizione sicura delle varibaili
    for (const [k, v] of Object.entries(variables)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    
    return text;
}
