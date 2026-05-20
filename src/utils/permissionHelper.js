import { PermissionFlagsBits } from 'discord.js';

/**
 * Checks if the bot has required permissions in a given channel.
 * @param {import('discord.js').GuildChannel | import('discord.js').ThreadChannel} channel
 * @param {bigint[]} permissionsToCheck
 * @returns {{ hasPermission: boolean, missing: string[] }}
 */
export function checkBotPermissions(channel, permissionsToCheck = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks
]) {
    if (!channel || !channel.guild) return { hasPermission: false, missing: ['Invalid Channel'] };

    const botMember = channel.guild.members.me;
    if (!botMember) return { hasPermission: false, missing: ['Bot not in guild'] };

    const permissions = channel.permissionsFor(botMember);
    const missing = [];

    for (const perm of permissionsToCheck) {
        if (!permissions.has(perm)) {
            const key = Object.keys(PermissionFlagsBits).find(k => PermissionFlagsBits[k] === perm);
            missing.push(key || perm.toString());
        }
    }

    return {
        hasPermission: missing.length === 0,
        missing
    };
}

/**
 * Generates a user-friendly error message for missing permissions.
 * @param {string[]} missing
 * @returns {string}
 */
export function formatMissingPermissions(missing) {
    return `Missing permissions: ${missing.join(', ')}. Make sure Verix has the required permissions in the channel or category, and that the bot role is high enough in the role list.`;
}
