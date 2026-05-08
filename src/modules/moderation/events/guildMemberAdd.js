import { Events, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import ModerationConfig from '../../../models/ModerationConfig.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

// In-memory join tracker: guildId -> [timestamps]
const guildJoins = new Map();
// Tracking lockdown state to avoid redundant updates
const activeLockdowns = new Set();

export default {
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const guild = member.guild;
        const guildId = guild.id;

        const config = await ModerationConfig.findOne({ guildId });
        if (!config || !config.enabled || !config.antiRaid?.enabled) return;

        const now = Date.now();
        if (!guildJoins.has(guildId)) guildJoins.set(guildId, []);
        
        const timestamps = guildJoins.get(guildId);
        timestamps.push(now);

        // Filter timestamps within window
        const windowStart = now - (config.antiRaid.timeWindow || 10000);
        const recentJoins = timestamps.filter(ts => ts > windowStart);
        guildJoins.set(guildId, recentJoins);

        // Check threshold
        if (recentJoins.length > config.antiRaid.joinsThreshold) {
            await handleRaidDetection(guild, member, config, recentJoins.length);
        }
    }
};

/**
 * Handles the raid detection logic.
 */
async function handleRaidDetection(guild, member, config, joinCount) {
    const action = config.antiRaid.action || 'notify';
    
    logger.warn(`[Anti-Raid] Potential raid detected in ${guild.name}! (${joinCount} joins in window)`);

    // 1. Notify Staff
    if (config.logChannelId) {
        try {
            const logChannel = await guild.channels.fetch(config.logChannelId).catch(() => null);
            if (logChannel) {
                const embed = await messageService.get(guild.id, 'moderation', 'anti_raid', {
                    details: `${joinCount} join in ${config.antiRaid.timeWindow / 1000}s`,
                    status: 'UNDER ATTACK',
                    action: action.toUpperCase()
                });

                await logChannel.send({ content: '@everyone', embeds: [embed] });
            }
        } catch (err) {
            logger.error('[Anti-Raid] Error sending staff notification:', err);
        }
    }

    // 2. Perform Action
    switch (action) {
        case 'lockdown':
            if (activeLockdowns.has(guild.id)) return;
            activeLockdowns.add(guild.id);
            
            const channelsToLock = config.antiRaid.lockdownChannels || [];
            for (const channelId of channelsToLock) {
                try {
                    const channel = await guild.channels.fetch(channelId).catch(() => null);
                    if (channel && channel.isTextBased()) {
                        await channel.permissionOverwrites.edit(guild.roles.everyone, {
                            [PermissionFlagsBits.SendMessages]: false
                        }, { reason: 'Anti-Raid Lockdown' });
                    }
                } catch (err) {
                    logger.error(`[Anti-Raid] Failed to lock channel ${channelId}:`, err);
                }
            }
            
            // Auto-release lockdown after 30 minutes? Or keep it manual?
            // For now, keep it manual (or 10 mins as a safeguard)
            setTimeout(() => activeLockdowns.delete(guild.id), 10 * 60 * 1000);
            break;

        case 'quarantine':
            const roleId = config.antiRaid.quarantineRoleId;
            if (roleId) {
                try {
                    await member.roles.add(roleId, 'Anti-Raid Quarantine').catch(() => {});
                } catch (err) {
                    logger.error(`[Anti-Raid] Failed to assign quarantine role:`, err);
                }
            }
            break;

        default:
            // 'notify' only
            break;
    }
}
