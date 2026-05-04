import Guild from '../models/Guild.js';
import logger from './logger.js';
import { ActivityType } from 'discord.js';

/**
 * Utility to handle White-label features (Identity sync, Branding removal logic).
 */
export const syncGuildIdentity = async (guild) => {
    if (!guild) return;

    try {
        const config = await Guild.findOne({ guildId: guild.id });
        if (!config || !config.isPremium || !config.customBotName) {
            // If bot has a custom nickname but premium is gone or name is cleared, reset it
            const botMember = guild.members.me;
            if (botMember && botMember.nickname) {
                await botMember.setNickname(null).catch(() => null);
            }
            return;
        }

        const botMember = guild.members.me;
        if (botMember && botMember.nickname !== config.customBotName) {
            // Check permissions
            if (botMember.permissions.has('ChangeNickname') || botMember.permissions.has('ManageNicknames')) {
                await botMember.setNickname(config.customBotName);
                logger.info(`[WhiteLabel] Updated nickname to "${config.customBotName}" in ${guild.name}`);
            } else {
                logger.warn(`[WhiteLabel] Missing ChangeNickname permission in ${guild.name}`);
            }
        }
    } catch (error) {
        logger.error(`[WhiteLabel] Error syncing identity for guild ${guild.id}:`, error);
    }
};

/**
 * Syncs the global bot status based on premium guild configurations.
 * Picks the most recently updated custom status.
 */
export const syncGlobalStatus = async (client) => {
    try {
        // Find premium guilds with a custom status, sorted by last update (we'll use updatedAt if exists, otherwise just pick one)
        const premiumConfigs = await Guild.find({ 
            isPremium: true, 
            customStatus: { $ne: null, $exists: true } 
        }).sort({ updatedAt: -1 }).limit(1);

        if (premiumConfigs.length > 0) {
            const config = premiumConfigs[0];
            const status = config.customStatus;
            const type = config.customStatusType !== undefined ? config.customStatusType : ActivityType.Playing;
            
            if (type === ActivityType.Custom) {
                client.user.setPresence({
                    activities: [{
                        name: 'Custom Status',
                        state: status,
                        type: ActivityType.Custom
                    }]
                });
            } else {
                client.user.setActivity(status, { type });
            }
            
            logger.info(`[WhiteLabel] Global status updated to: "${status}" (Type: ${type})`);
        }
    } catch (error) {
        logger.error('[WhiteLabel] Error syncing global status:', error);
    }
};

export default {
    syncGuildIdentity,
    syncGlobalStatus
};
