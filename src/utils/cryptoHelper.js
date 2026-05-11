import crypto from 'crypto';
import logger from './logger.js';

const ALGORITHM = 'aes-256-cbc';
const LEGACY_ENCRYPTION_KEY = '01234567890123456789012345678901';
const IV_LENGTH = 16;

const resolveEncryptionKey = () => {
    const rawKey = process.env.ENCRYPTION_KEY;

    if (!rawKey) {
        logger.warn('[SECURITY] ENCRYPTION_KEY is not set. Using legacy development key; set a 32+ character key before production launch.');
        return Buffer.from(LEGACY_ENCRYPTION_KEY).slice(0, 32);
    }

    if (Buffer.byteLength(rawKey) < 32) {
        logger.warn('[SECURITY] ENCRYPTION_KEY is shorter than 32 bytes. Pad it to at least 32 characters before production launch.');
    }

    return Buffer.from(rawKey).slice(0, 32);
};

const ENCRYPTION_KEY = resolveEncryptionKey();

export const encrypt = (text) => {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text) => {
    if (!text) return null;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

export default { encrypt, decrypt };
