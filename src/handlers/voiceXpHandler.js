import LevelingConfig from '../models/LevelingConfig.js';
import { addXp } from './levelingHandler.js';
import logger from '../utils/logger.js';

// Global cache to track minutes spent in voice channels per user in a guild
global.voiceXpTracker = global.voiceXpTracker || new Map();

let intervalId = null;

export const start = (client) => {
    if (intervalId) return;

    logger.info('[Voice XP] Starting Voice XP background monitoring service (1-minute intervals).');

    intervalId = setInterval(async () => {
        try {
            const guilds = client.guilds.cache.values();

            for (const guild of guilds) {
                // Fetch leveling configurations for this guild
                const config = await LevelingConfig.findOne({ guildId: guild.id });
                if (!config || !config.enabled) continue;

                // Load voice states in the guild
                const voiceStates = guild.voiceStates.cache.values();

                for (const state of voiceStates) {
                    const member = state.member;
                    if (!member || member.user.bot) continue;

                    // 1. Anti-AFK Farming: Skip if muted or deafened (self or server)
                    const isMutedOrDeafened = state.selfMute || state.serverMute || state.selfDeaf || state.serverDeaf;
                    if (isMutedOrDeafened) continue;

                    // 2. Ignore AFK channel
                    if (state.channelId === guild.afkChannelId) continue;

                    // 3. Ignore configured ignored channels
                    if (config.ignoredChannels.includes(state.channelId)) continue;

                    // 4. Ignore users with ignored roles
                    if (member.roles.cache.some(r => config.ignoredRoles.includes(r.id))) continue;

                    // 5. Min Users Count: Must have at least N active non-bot users in the same voice channel
                    const channel = state.channel;
                    if (!channel) continue;

                    const activeNonBots = channel.members.filter(m => {
                        if (m.user.bot) return false;
                        // Also verify they aren't deafened/muted
                        const ms = guild.voiceStates.cache.get(m.id);
                        if (!ms) return false;
                        return !(ms.selfMute || ms.serverMute || ms.selfDeaf || ms.serverDeaf);
                    }).size;

                    const minUsers = config.voiceMinUsers !== undefined ? config.voiceMinUsers : 2;
                    if (activeNonBots < minUsers) continue;

                    // If all criteria passed, track the minute
                    const trackerKey = `${guild.id}-${member.id}`;
                    const currentMins = (global.voiceXpTracker.get(trackerKey) || 0) + 1;
                    const interval = config.voiceXpInterval || 5;

                    if (currentMins >= interval) {
                        global.voiceXpTracker.set(trackerKey, 0);
                        const rate = config.voiceXpRate !== undefined ? config.voiceXpRate : 10;
                        
                        logger.debug(`[Voice XP] Awarding ${rate} XP to ${member.user.tag} in VC ${channel.name} (${guild.name})`);
                        await addXp(guild, member, rate, 'voice', channel);
                    } else {
                        global.voiceXpTracker.set(trackerKey, currentMins);
                    }
                }
            }
        } catch (error) {
            logger.error('[Voice XP] Error inside Voice XP background checker:', error);
        }
    }, 60000); // Check once per minute
};

export const stop = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        logger.info('[Voice XP] Background monitoring service stopped.');
    }
};
