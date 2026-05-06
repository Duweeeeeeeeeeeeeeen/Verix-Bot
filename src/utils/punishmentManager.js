import ModerationConfig from '../models/ModerationConfig.js';
import Infraction from '../models/Infraction.js';
import { sendUserNotification } from './notificationService.js';
import logger from './logger.js';
import messageService from './messageService.js';

// Cooldown tracker for warnings: guildId:userId -> lastWarnTimestamp
const warningCooldowns = new Map();

/**
 * Handles progressive punishments for a user in a guild.
 * @param {import('discord.js').GuildMember} member 
 * @param {string} reason 
 * @param {import('discord.js').TextChannel} channel
 */
export async function handleUserInfraction(member, reason = 'Violazione protocollo', channel = null) {
    const { guild, id: userId } = member;
    const guildId = guild.id;

    try {
        // 1. Fetch Config
        const config = await ModerationConfig.findOne({ guildId });
        if (!config || !config.enabled) return;

        // 2. Fetch/Update Infractions
        let infraction = await Infraction.findOne({ guildId, userId });
        const now = new Date();

        if (infraction) {
            // Check for reset (convert resetTime days to ms)
            const resetMs = config.resetTime * 24 * 60 * 60 * 1000;
            if (now - infraction.lastInfraction > resetMs) {
                infraction.count = 1;
            } else {
                infraction.count += 1;
            }
            infraction.lastInfraction = now;
            await infraction.save();
        } else {
            infraction = await Infraction.create({ guildId, userId, count: 1, lastInfraction: now });
        }

        // 3. Determine Punishment
        // Sort punishments by level descending to find the highest threshold reached
        const sortedPunishments = [...config.punishments].sort((a, b) => b.level - a.level);
        const punishment = sortedPunishments.find(p => infraction.count >= p.level);

        if (!punishment) return;

        // 4. Apply Action
        await applyPunishment(member, punishment, reason, channel, config);

    } catch (error) {
        logger.error(`[PunishmentManager] Error handling infraction for ${userId}:`, error);
    }
}

/**
 * Executes a specific punishment action.
 * @param {import('discord.js').GuildMember} member 
 * @param {object} punishment 
 * @param {string} reason 
 * @param {import('discord.js').TextChannel} channel
 * @param {object} config - Moderation config
 */
async function applyPunishment(member, punishment, reason, channel, config) {
    const { guild, user } = member;
    const action = punishment.action;
    const duration = punishment.duration;
    const guildId = guild.id;
    const userId = user.id;
    const userKey = `${guildId}:${userId}`;

    // Handle warning cooldown to avoid spamming the same user
    if (action === 'warn') {
        const lastWarn = warningCooldowns.get(userKey);
        if (lastWarn && (Date.now() - lastWarn < 10000)) return; // 10s cooldown
        warningCooldowns.set(userKey, Date.now());
    }

    try {
        const embed = await messageService.get(guildId, 'moderation', action, {
            user: `<@${userId}>`,
            reason,
            duration: duration?.toString() || '0'
        });

        const notificationPayload = { embeds: [embed] };
        
        // Use flexible notification system
        await sendUserNotification(guild, user, config.notifications, notificationPayload);

        switch (action) {
            case 'warn':
                // Warn is just notification, already handled by sendUserNotification
                break;

            case 'timeout':
                if (member.manageable) {
                    await member.timeout(duration * 60 * 1000, reason);
                }
                break;

            case 'kick':
                if (member.kickable) {
                    await member.kick(reason);
                }
                break;

            case 'ban':
                if (member.bannable) {
                    await member.ban({ reason });
                }
                break;
        }

        logger.info(`[PunishmentManager] Applied ${action} to ${user.tag} in ${guild.name} (Reason: ${reason})`);

    } catch (error) {
        logger.error(`[PunishmentManager] Failed to apply ${action} to ${user.id}:`, error);
    }
}
