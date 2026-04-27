import { Events, PermissionFlagsBits } from 'discord.js';
import AntiSpamConfig from '../../../models/AntiSpamConfig.js';
import logger from '../../../utils/logger.js';
import { handleUserInfraction } from '../../../utils/punishmentManager.js';

// In-memory tracker: guildId:userId -> [timestamps]
const userMessages = new Map();
const warnedUsers = new Set(); // To avoid spamming warnings

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Fetch config (ideally cached, but moduleHandler handles activation check)
        const config = await AntiSpamConfig.findOne({ guildId });
        if (!config || !config.enabled) return;

        // 1. Check Exceptions (Staff, Specific Channels)
        // If user has Administrator permission, ignore
        if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        // Check ignored roles
        if (config.ignoredRoles?.some(roleId => message.member.roles.cache.has(roleId))) return;

        // Check ignored channels
        if (config.ignoredChannels?.includes(message.channel.id)) return;

        // 2. Track Message
        const now = Date.now();
        const userKey = `${guildId}:${userId}`;
        
        if (!userMessages.has(userKey)) {
            userMessages.set(userKey, []);
        }

        const timestamps = userMessages.get(userKey);
        timestamps.push(now);

        // Filter timestamps outside the window
        const windowStart = now - config.timeWindow;
        const recentMessages = timestamps.filter(ts => ts > windowStart);
        userMessages.set(userKey, recentMessages);

        // 3. Spam Detection
        if (recentMessages.length > config.maxMessages) {
            // SPAM DETECTED
            try {
                // Delete message if configured
                if (config.deleteSpam && message.deletable) {
                    await message.delete().catch(() => {});
                }

                // Trigger Progressive Punishment System
                await handleUserInfraction(message.member, 'Spam rilevato dal sistema AntiSpam');

                logger.info(`[AntiSpam] Blocked spam from ${message.author.tag} in ${message.guild.name}`);
            } catch (error) {
                logger.error('[AntiSpam] Error handling spam:', error);
            }
        }
    }
};
