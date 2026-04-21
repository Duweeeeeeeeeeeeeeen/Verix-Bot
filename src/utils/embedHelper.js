import { EmbedBuilder } from 'discord.js';
import placeholderHelper from './placeholderHelper.js';

/**
 * Genera un embed a partire dalla configurazione DB e i placeholder forniti.
 * @param {Object} embedConfig - Oggetto configurazione dell'embed (es. config.embeds.start)
 * @param {Object} placeholders - Oggetto con i valori per i placeholder
 * @param {Object} fullConfig - Oggetto configurazione completo (opzionale, per i colori del tema)
 * @returns {EmbedBuilder|null}
 */
export function buildEmbed(embedConfig, placeholders = {}, fullConfig = {}) {
    if (!embedConfig) return null;
    if (embedConfig.enabled === false) return null;

    const embed = new EmbedBuilder();

    const title = replacePlaceholders(embedConfig.title, placeholders);
    if (title && title.trim().length > 0) embed.setTitle(title);

    const desc = replacePlaceholders(embedConfig.description, placeholders);
    if (desc && desc.trim().length > 0) embed.setDescription(desc);

    // Resolve Theme Color or Hex
    let color = embedConfig.color || '#5865F2';
    if (fullConfig.colors && fullConfig.colors[color]) {
        color = fullConfig.colors[color];
    }
    embed.setColor(color);

    if (embedConfig.footer) {
        embed.setFooter({ text: replacePlaceholders(embedConfig.footer, placeholders) });
    }

    if (embedConfig.image) {
        embed.setImage(replacePlaceholders(embedConfig.image, placeholders));
    }

    if (embedConfig.thumbnail) {
        embed.setThumbnail(replacePlaceholders(embedConfig.thumbnail, placeholders));
    }

    if (embedConfig.fields && Array.from(embedConfig.fields).length > 0) {
        const fields = embedConfig.fields.map(f => ({
            name: replacePlaceholders(f.name, placeholders),
            value: replacePlaceholders(f.value, placeholders),
            inline: f.inline || false
        }));
        embed.addFields(fields);
    }

    if (embedConfig.timestamp !== false) {
        embed.setTimestamp();
    }

    return embed;
}

/**
 * Sostituisce i placeholder in una stringa in modo robusto.
 * @param {string} text 
 * @param {Object} placeholders 
 * @returns {string}
 */
export function replacePlaceholders(text, placeholders) {
    if (!text) return '';
    
    // 1. Prepare raw variables map with standard shortcuts
    const vars = {
        guild: placeholders.guild?.name || placeholders.guild || '',
        user: placeholders.user?.toString() || placeholders.user || '',
        user_tag: placeholders.user?.tag || placeholders.user?.user?.tag || placeholders.user || '',
        user_name: placeholders.user?.username || placeholders.user?.user?.username || placeholders.user || '',
        user_id: placeholders.user?.id || placeholders.user_id || '',
        
        staff: placeholders.staff?.toString() || placeholders.staff || '',
        staff_tag: placeholders.staff?.tag || placeholders.staff?.user?.tag || placeholders.staff || '',
        staff_name: placeholders.staff?.username || placeholders.staff?.user?.username || placeholders.staff || '',
        
        // Dynamic Resolution: map any snake_case <-> camelCase variant provided
        question: placeholders.question || '',
        answer: placeholders.answer || '',
        reason: placeholders.reason || '',
        app_id: placeholders.app_id || placeholders.appId || '',
        
        // Time & Counts (Handles 0 correctly)
        time_left: placeholders.time_left ?? placeholders.timeLeft ?? '',
        time_limit: placeholders.time_limit ?? placeholders.timeLimit ?? '',
        total_questions: placeholders.total_questions ?? placeholders.totalQuestions ?? '',
        current_index: placeholders.current_index ?? placeholders.currentIndex ?? '',
        min_length: placeholders.min_length ?? placeholders.minLength ?? '',
        next_attempt: placeholders.next_attempt ?? placeholders.nextAttempt ?? '',
        cooldown: placeholders.cooldown ?? '',
        
        // Others
        bg_link: placeholders.bg_link ?? placeholders.bgLink ?? '',
        bg_desc: placeholders.bg_desc ?? placeholders.bgDesc ?? '',
        bg_attachment: placeholders.bg_attachment ?? '',
        voice_channel: placeholders.voice_channel ?? placeholders.voiceChannel ?? '',
        server: placeholders.server ?? '',
        players: placeholders.players ?? '',
        maxPlayers: placeholders.maxPlayers ?? '',
        recap: placeholders.recap ?? '',
        checklist: placeholders.checklist ?? ''
    };

    // 2. Dual-mapping: For every key in vars, also add its alternative case version
    // This ensures {minLength} works even if we internally defined it as min_length
    const expandedVars = { ...vars };
    for (const [key, value] of Object.entries(vars)) {
        // Convert snake_to_camel
        if (key.includes('_')) {
            const camelKey = key.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
            if (!(camelKey in expandedVars)) expandedVars[camelKey] = value;
        } 
        // Convert camelToSnake
        else {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            if (!(snakeKey in expandedVars)) expandedVars[snakeKey] = value;
        }
    }

    return placeholderHelper.replace(text, expandedVars);
}
