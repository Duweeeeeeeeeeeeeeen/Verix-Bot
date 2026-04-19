/**
 * placeholderHelper.js
 * Centralized utility for case-insensitive placeholder replacement.
 */

/**
 * Replace placeholders in a string using variables from an object.
 * Supports format: {key}, {Key}, {KEY}
 * 
 * @param {string} text - The input string containing placeholders.
 * @param {Object} variables - Key-value pairs for replacements.
 * @returns {string} - The processed string.
 */
export function replacePlaceholders(text, variables = {}) {
    if (!text || typeof text !== 'string') return text || '';

    let result = text;

    // Iterate over provided variables and perform case-insensitive replacement
    for (const [key, value] of Object.entries(variables)) {
        // Escape special regex characters in the key (like {} if they were passed)
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Handle both {key} and key variants
        const placeholder = escapedKey.startsWith('\\{') ? escapedKey : `\\{${escapedKey}\\}`;
        
        const regex = new RegExp(placeholder, 'gi');
        result = result.replace(regex, value !== undefined && value !== null ? value : '');
    }

    return result;
}

export default {
    replace: replacePlaceholders
};
