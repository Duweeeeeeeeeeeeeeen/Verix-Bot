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
        const botMember = await guild.members.fetchMe().catch(() => null);
        if (!botMember) {
            logger.warn(`[WhiteLabel] Could not fetch bot member in guild ${guild.id} (${guild.name})`);
            return;
        }

        // Reset condition: Missing config, not premium, or custom name is null/empty
        if (!config || !config.isPremium || !config.customBotName || config.customBotName.trim() === '') {
            if (botMember.nickname) {
                await botMember.setNickname(null).catch(err => logger.error(`[WhiteLabel] Failed to reset nickname in ${guild.name}:`, err));
                logger.info(`[WhiteLabel] Reset nickname to default in ${guild.name}`);
            }
            return;
        }

        if (botMember && botMember.nickname !== config.customBotName) {
            // Check permissions
            const canChange = botMember.permissions.has('ChangeNickname') || botMember.permissions.has('ManageNicknames') || botMember.permissions.has('Administrator');
            
            logger.info(`[WhiteLabel] Attempting nickname change in ${guild.name}: "${botMember.nickname || 'Default'}" -> "${config.customBotName}"`);
            
            if (canChange) {
                await botMember.setNickname(config.customBotName).catch(err => {
                    logger.error(`[WhiteLabel] Error setting nickname in ${guild.name}:`, err.message);
                });
                logger.info(`[WhiteLabel] Successfully updated nickname in ${guild.name}`);
            } else {
                logger.warn(`[WhiteLabel] Missing ChangeNickname permission in ${guild.name}.`);
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
export const syncGlobalStatus = async (client, force = false) => {
    try {
        const premiumConfig = await Guild.findOne({ 
            isPremium: true, 
            'customStatuses.0': { $exists: true } 
        }).sort({ updatedAt: -1 });

        if (!premiumConfig) return;

        const now = Date.now();
        const rotationIntervalMs = (premiumConfig.statusRotationInterval || 60) * 1000;

        if (force) {
            currentStatusIndex = 0;
            lastSyncTime = 0;
        }

        // Only rotate if enough time has passed (or if forced on startup/update)
        if (!force && now - lastSyncTime < rotationIntervalMs && lastSyncTime !== 0) {
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
