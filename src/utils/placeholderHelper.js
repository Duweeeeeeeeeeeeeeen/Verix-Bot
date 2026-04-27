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
        let cleanValue = value !== undefined && value !== null ? String(value) : '';

        // SECURITY: If this is a 'name' or 'tag' placeholder, strip any discord mentions
        // to prevent formatting issues in titles/embeds (e.g. {user_name} should not be <@ID>)
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('tag')) {
            // Strips <@ID>, <@!ID>, <@&ID>, <#ID>
            cleanValue = cleanValue.replace(/<@!?&?(\d+)>|<#\d+>/g, '').trim();
        }

        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const placeholder = escapedKey.startsWith('\\{') ? escapedKey : `\\{${escapedKey}\\}`;
        const regex = new RegExp(placeholder, 'gi');
        result = result.replace(regex, cleanValue);
    }

    return result;
}

export default {
    replace: replacePlaceholders
};
