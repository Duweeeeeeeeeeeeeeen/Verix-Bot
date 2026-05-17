import it from './defaultMessages.it.js';
import en from './defaultMessages.en.js';

const defaultMessages = { it, en };

export default defaultMessages;

export function getMessages(lang = 'en') {
    return defaultMessages[lang] || defaultMessages['en'];
}
