import it from './defaultMessages.it.js';
import en from './defaultMessages.en.js';
import es from './defaultMessages.es.js';
import fr from './defaultMessages.fr.js';
import de from './defaultMessages.de.js';
import pt from './defaultMessages.pt.js';

const locales = { it, en, es, fr, de, pt };

/**
 * Translate a key into the given language with variable substitution.
 * @param {string} key - Dot-notation key (e.g., 'system.no_permission.title')
 * @param {string} lang - Language code ('it' or 'en')
 * @param {object} vars - Variables to replace in the string (e.g., { user: 'Antigravity' })
 * @returns {string} - Translated string or the key if not found
 */
export function t(key, lang = 'en', vars = {}) {
    const locale = locales[lang] || locales['en']; // fallback to english
    const keys = key.split('.');
    
    let val = locale;
    for (const k of keys) {
        val = val?.[k];
    }

    if (typeof val !== 'string') {
        // Handle cases where we might want the whole object (like typesConfig)
        if (val && typeof val === 'object') return val;
        return key; 
    }
    
    // Replace {variable} with the provided values
    return val.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
}

/**
 * Get the full default messages object for a specific language.
 * @param {string} lang - Language code
 * @returns {object}
 */
export function getDefaultMessages(lang = 'en') {
    return locales[lang] || locales['en'];
}

export default t;
