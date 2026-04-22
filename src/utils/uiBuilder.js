import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getGlobalConfig } from '../core/globalConfigManager.js';
import logger from './logger.js';

// Map string → ButtonStyle enum
export const STYLE_MAP = {
    PRIMARY:   ButtonStyle.Primary,
    SUCCESS:   ButtonStyle.Success,
    DANGER:    ButtonStyle.Danger,
    SECONDARY: ButtonStyle.Secondary,
    LINK:      ButtonStyle.Link
};

export function getButtonStyle(style) {
    if (!style) return ButtonStyle.Primary;
    return STYLE_MAP[style.toUpperCase()] || ButtonStyle.Primary;
}

/**
 * Build an ActionRowBuilder from a panel's button config in GlobalConfig.
 * Falls back to hardcoded defaults if config is missing or disabled.
 *
 * @param {string} guildId
 * @param {'whitelist'|'tickets'|'voice'} panel
 * @param {object} [idSuffixes={}] - Append dynamic suffixes to specific customIds
 *   e.g. { approve_voice: memberId, deny_voice: memberId }
 * @returns {Promise<ActionRowBuilder[]>}
 */
export async function buildButtonRows(guildId, panel, idSuffixes = {}) {
    try {
        const globalConfig = await getGlobalConfig(guildId);
        // Map: whitelist -> whitelistButtons, tickets -> ticketButtons, voice -> voiceButtons
        const key = panel === 'tickets' ? 'ticketButtons' : `${panel}Buttons`;
        const buttons = globalConfig?.ui?.[key] || [];

        if (!buttons.length) {
            return [];
        }

        const enabled = buttons.filter(b => b.enabled !== false);
        if (!enabled.length) return [];

        // Discord allows max 5 buttons per row
        const rows = [];
        for (let i = 0; i < enabled.length; i += 5) {
            const slice = enabled.slice(i, i + 5);
            const row = new ActionRowBuilder();

            for (const btn of slice) {
                const customId = idSuffixes[btn.customId]
                    ? `${btn.customId}_${idSuffixes[btn.customId]}`
                    : btn.customId;

                const builder = new ButtonBuilder()
                    .setCustomId(customId)
                    .setLabel(btn.label || btn.customId)
                    .setStyle(STYLE_MAP[btn.style] ?? ButtonStyle.Primary);

                if (btn.emoji) {
                    try { builder.setEmoji(btn.emoji); } catch { /* ignore invalid emoji */ }
                }

                row.addComponents(builder);
            }

            rows.push(row);
        }

        return rows;
    } catch (error) {
        logger.error(`[uiBuilder] Error building buttons for panel ${panel}:`, error);
        return [];
    }
}

/**
 * Get a single button config by its base customId.
 * Useful for reading label/emoji from config for embeds.
 */
export async function getButtonConfig(guildId, panel, customId) {
    try {
        const globalConfig = await getGlobalConfig(guildId);
        const buttons = globalConfig?.ui?.[panel]?.buttons || [];
        return buttons.find(b => b.customId === customId) || null;
    } catch {
        return null;
    }
}
