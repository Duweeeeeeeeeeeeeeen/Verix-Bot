import Guild from '../models/Guild.js';
import FiveMConfig from '../models/FiveMConfig.js';
import logger from './logger.js';
import { ActivityType } from 'discord.js';

let currentStatusIndex = 0;
let lastSyncTime = 0;

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
 * Picks the most recently updated config and rotates through its statuses.
 */
export const syncGlobalStatus = async (client) => {
    try {
        // Find the latest premium config with at least one status
        const premiumConfig = await Guild.findOne({ 
            isPremium: true, 
            'customStatuses.0': { $exists: true } 
        }).sort({ updatedAt: -1 });

        if (!premiumConfig) return;

        const now = Date.now();
        const rotationIntervalMs = (premiumConfig.statusRotationInterval || 60) * 1000;

        // Only rotate if enough time has passed (or if forced on startup/update)
        if (now - lastSyncTime < rotationIntervalMs && lastSyncTime !== 0) {
            return;
        }

        const statuses = premiumConfig.customStatuses;
        if (currentStatusIndex >= statuses.length) currentStatusIndex = 0;
        
        const config = statuses[currentStatusIndex];
        let statusText = config.text;
        const type = config.type !== undefined ? config.type : ActivityType.Playing;

        // Handle Placeholders
        if (statusText.includes('{players}') || statusText.includes('{max_players}')) {
            const fivemConfig = await FiveMConfig.findOne({ guildId: premiumConfig.guildId });
            if (fivemConfig && fivemConfig.servers && fivemConfig.servers[0] && client.fivemManager) {
                const server = fivemConfig.servers[0];
                const data = await client.fivemManager.fetchServerData(server.serverIp);
                if (data && data.online) {
                    statusText = statusText.replace('{players}', data.players).replace('{max_players}', data.maxPlayers);
                } else {
                    statusText = statusText.replace('{players}', '0').replace('{max_players}', '0');
                }
            }
        }

        // Apply Status
        if (type === ActivityType.Custom) {
            client.user.setPresence({
                activities: [{
                    name: 'Custom Status',
                    state: statusText,
                    type: ActivityType.Custom
                }]
            });
        } else {
            client.user.setActivity(statusText, { type });
        }

        logger.info(`[WhiteLabel] Global status rotated to: "${statusText}" (${currentStatusIndex + 1}/${statuses.length})`);
        
        // Prepare next index
        currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
        lastSyncTime = now;

    } catch (error) {
        logger.error('[WhiteLabel] Error syncing global status:', error);
    }
};

export default {
    syncGuildIdentity,
    syncGlobalStatus
};
