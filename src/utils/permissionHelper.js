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
            // Find key name for the missing permission
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
    return `❌ **Permessi Mancanti!** Il bot non può operare correttamente.\n\n**Cosa fare:**\n- Assicurati che il bot abbia i permessi necessari nella **Categori** o nel **Canale**.\n- Controlla i permessi: \`${missing.join(', ')}\`.\n- Verifica che il ruolo del bot sia posizionato correttamente in alto nella lista ruoli.`;
}
