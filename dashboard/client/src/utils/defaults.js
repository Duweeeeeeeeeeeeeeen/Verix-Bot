import { getMessages } from '../locales/index';

export const defaultDesign = {
    embedColor: '#6366f1',
    buttonStyle: 'PRIMARY',
    showFooter: true,
    footerText: '',
    voiceSettings: {
        joinChannelId: '',
        staffRoleIds: [],
        cooldown: 24,
        autoMove: true
    }
};

export function mergeConfig(dbConfig, moduleName, lang) {
    // If no lang is provided, try to get from localStorage (client side only)
    if (!lang && typeof window !== 'undefined') {
        lang = localStorage.getItem('verix-language') || 'en';
    }
    
    const defaultMessages = getMessages(lang || 'en');
    const defaults = {
        ...defaultDesign,
        ...(defaultMessages[moduleName] || {})
    };

    // Initialize with defaults
    const result = { ...defaults };
    
    if (!dbConfig) return result;

    // Apply database overrides
    const config = typeof dbConfig.toObject === 'function' ? dbConfig.toObject() : dbConfig;
    
    // Core merging logic
    for (const [key, value] of Object.entries(config)) {
        if (value === null || value === undefined) continue;

        // If it's the 'embeds' object, deep merge each embed
        if (key === 'embeds' && typeof value === 'object') {
            if (!result.embeds) result.embeds = {};
            for (const [eKey, eValue] of Object.entries(value)) {
                result.embeds[eKey] = { ...(result.embeds[eKey] || {}), ...eValue };
            }
        } 
        // If it's an object (like voiceSettings), shallow merge
        else if (typeof value === 'object' && !Array.isArray(value)) {
            result[key] = { ...(result[key] || {}), ...value };
        }
        // Otherwise, overwrite
        else {
            result[key] = value;
        }
    }

    // Ensure all keys from defaultMessages that look like embeds are also in .embeds for the UI
    if (!result.embeds) result.embeds = {};
    const moduleDefaults = defaultMessages[moduleName] || {};
    
    for (const [key, value] of Object.entries(moduleDefaults)) {
        if (value && typeof value === 'object' && (value.title || value.description)) {
            // Map flat keys from defaultMessages into .embeds if they are not already there
            if (!result.embeds[key]) {
                result.embeds[key] = { ...value, ...(config[key] || {}) };
            }
        }
    }

    return result;
}
