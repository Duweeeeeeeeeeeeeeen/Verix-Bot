import it from './defaultMessages.it.js';
import en from './defaultMessages.en.js';

const defaultMessages = { it, en };

export default defaultMessages;

export function getMessages(lang = 'it') {
    return defaultMessages[lang] || defaultMessages['it'];
}
