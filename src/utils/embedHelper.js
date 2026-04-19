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
 * Sostituisce i placeholder in una stringa.
 * @param {string} text 
 * @param {Object} placeholders 
 * @returns {string}
 */
export function replacePlaceholders(text, placeholders) {
    if (!text) return '';
    
    // Mapping of available variables
    const vars = {
        guild: placeholders.guild || '',
        user: placeholders.user || '',
        user_id: placeholders.user_id || '',
        question: placeholders.question || '',
        answer: placeholders.answer || '',
        reason: placeholders.reason || '',
        time_left: placeholders.time_left || '',
        time_limit: placeholders.time_limit || '',
        total_questions: placeholders.total_questions || '',
        current_index: placeholders.current_index || '',
        min_length: placeholders.min_length || '',
        app_id: placeholders.app_id || '',
        staff: placeholders.staff || '',
        bg_link: placeholders.bg_link || '',
        bg_desc: placeholders.bg_desc || '',
        bg_attachment: placeholders.bg_attachment || '',
        voice_channel: placeholders.voice_channel || '',
        server: placeholders.server || '',
        players: placeholders.players || '',
        maxPlayers: placeholders.maxPlayers || '',
        recap: placeholders.recap || '',
        cooldown: placeholders.cooldown || '',
        checklist: placeholders.checklist || ''
    };

    return placeholderHelper.replace(text, vars);
}
