import UserExperience from '../models/UserExperience.js';
import LevelingConfig from '../models/LevelingConfig.js';
import logger from '../utils/logger.js';

export const getXpForLevel = (level) => {
    // Standard formula: 5 * (lvl^2) + (50 * lvl) + 100
    return 5 * (level ** 2) + 50 * level + 100;
};

export const getCumulativeXpForLevel = (level) => {
    let total = 0;
    for (let i = 0; i < level; i++) {
        total += getXpForLevel(i);
    }
    return total;
};

export const calculateLevel = (xp) => {
    let level = 0;
    while (xp >= getXpForLevel(level)) {
        xp -= getXpForLevel(level);
        level++;
    }
    return level;
};

export const addXp = async (guild, member, amount, reason = '', channelContext = null, interactionContext = null) => {
    if (!guild || !member) return { success: false, error: 'Missing guild or member' };

    const guildId = guild.id;
    const userId = member.id;

    try {
        const config = await LevelingConfig.findOne({ guildId });
        if (!config || !config.enabled) return { success: false, error: 'Leveling disabled' };

        // Exclude ignored channels / roles if reason is message
        if (reason === 'message' && channelContext) {
            if (config.ignoredChannels.includes(channelContext.id)) {
                return { success: false, error: 'Ignored channel' };
            }
            if (member.roles && member.roles.cache.some(r => config.ignoredRoles.includes(r.id))) {
                return { success: false, error: 'Ignored role' };
            }
        }

        let userExp = await UserExperience.findOne({ guildId, userId });
        if (!userExp) {
            userExp = new UserExperience({ guildId, userId });
        }

        const now = new Date();
        
        // Daily Reset Check: Reset daily XP if the UTC calendar date has changed
        const lastReset = userExp.lastXpReset || new Date();
        const isNewDay = now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
                          now.getUTCMonth() !== lastReset.getUTCMonth() ||
                          now.getUTCDate() !== lastReset.getUTCDate();

        if (isNewDay) {
            userExp.dailyXpEarned = 0;
            userExp.lastXpReset = now;
        }

        // Daily Cap Check
        const dailyCap = config.dailyXpCap || 0;
        if (dailyCap > 0 && userExp.dailyXpEarned >= dailyCap) {
            if (reason === 'message') {
                userExp.totalMessages += 1;
            }
            userExp.lastXpGain = now;
            await userExp.save();
            return { success: false, error: 'Daily XP cap reached' };
        }

        // Apply rates & double XP multiplier (including scheduler check)
        let eventMultiplier = 1;
        if (config.doubleXpScheduled) {
            const today = now.getDay(); // 0-6 (Sunday-Saturday)
            if (config.doubleXpDays && config.doubleXpDays.includes(today)) {
                const startStr = config.doubleXpStartHour || "00:00";
                const endStr = config.doubleXpEndHour || "23:59";
                
                const [startH, startM] = startStr.split(':').map(Number);
                const [endH, endM] = endStr.split(':').map(Number);
                
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                const startMinutes = startH * 60 + (startM || 0);
                const endMinutes = endH * 60 + (endM || 0);
                
                if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                    eventMultiplier = 2;
                }
            }
        }

        let actualGain = amount * (config.xpRate || 1) * (config.xpMultiplier || 1) * eventMultiplier;

        // Apply cap if it would exceed the remaining daily quota
        if (dailyCap > 0 && userExp.dailyXpEarned + actualGain > dailyCap) {
            actualGain = Math.max(0, dailyCap - userExp.dailyXpEarned);
        }

        if (actualGain <= 0) {
            return { success: false, error: 'Zero XP gain' };
        }

        userExp.xp += actualGain;
        userExp.dailyXpEarned += actualGain;
        if (reason === 'message') {
            userExp.totalMessages += 1;
        }
        userExp.lastXpGain = now;

        const newLevel = calculateLevel(userExp.xp);
        if (newLevel > userExp.level) {
            const oldLevel = userExp.level;
            userExp.level = newLevel;
            
            // Notify Level Up
            if (config.notifyLevelUp && config.levelUpNotificationType !== 'silent') {
                const template = config.notifyTextTemplate || "🎉 Complimenti **{user}**! Sei salito al livello **{level}**!";
                const content = template
                    .replace(/{user}/g, `<@${userId}>`)
                    .replace(/{level}/g, `${newLevel}`);

                let sent = false;
                const mode = config.levelUpNotificationType || 'channel';

                // Helper to send to channel
                const sendToChannel = async () => {
                    const channel = config.notifyChannelId ? 
                        guild.channels.cache.get(config.notifyChannelId) : 
                        (channelContext || null);
                    
                    if (channel && channel.permissionsFor(guild.members.me).has('SendMessages')) {
                        await channel.send(content).catch(() => {});
                        return true;
                    } else {
                        // Fallback to system channel or first available text channel
                        const systemChannel = guild.systemChannel || guild.channels.cache.find(c => c.isTextChannel() && c.permissionsFor(guild.members.me).has('SendMessages'));
                        if (systemChannel) {
                            await systemChannel.send(content).catch(() => {});
                            return true;
                        }
                    }
                    return false;
                };

                // Ephemeral Notification Flow
                if (mode === 'ephemeral') {
                    if (interactionContext) {
                        try {
                            if (interactionContext.replied || interactionContext.deferred) {
                                await interactionContext.followUp({ content, ephemeral: true });
                            } else {
                                await interactionContext.reply({ content, ephemeral: true });
                            }
                            sent = true;
                        } catch (e) {
                            sent = false;
                        }
                    }
                    // Ephemeral fallback: attempt DM
                    if (!sent) {
                        const dmSent = await member.send(content).then(() => true).catch(() => false);
                        if (dmSent) {
                            sent = true;
                        } else {
                            // DM closed fallback: channel
                            sent = await sendToChannel();
                        }
                    }
                }

                // DM Notification Flow
                if (mode === 'dm' && !sent) {
                    const dmSent = await member.send(content).then(() => true).catch(() => false);
                    if (dmSent) {
                        sent = true;
                    } else {
                        // DM closed fallback: channel
                        sent = await sendToChannel();
                    }
                }

                // Channel Notification Flow (Default)
                if (mode === 'channel' && !sent) {
                    await sendToChannel();
                }
            }

            // Role Rewards
            const rewards = config.roleRewards.filter(r => r.level <= newLevel && r.level > oldLevel);
            for (const reward of rewards) {
                const role = guild.roles.cache.get(reward.roleId);
                if (role) {
                    await member.roles.add(role).catch(() => {});
                }
            }
        }

        await userExp.save();
        return { success: true, actualGain };
    } catch (err) {
        logger.error(`[Leveling] Error in addXp for ${userId}:`, err);
        return { success: false, error: err.message };
    }
};

export const handleMessageXp = async (message) => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    try {
        const config = await LevelingConfig.findOne({ guildId });
        if (!config || !config.enabled) return;

        // Check ignored channels/roles
        if (config.ignoredChannels.includes(message.channel.id)) return;
        if (message.member && message.member.roles.cache.some(r => config.ignoredRoles.includes(r.id))) return;

        let userExp = await UserExperience.findOne({ guildId, userId });
        if (!userExp) {
            userExp = new UserExperience({ guildId, userId });
        }

        const now = new Date();
        const cooldownMs = (config.cooldown || 60) * 1000;

        if (now - userExp.lastXpGain < cooldownMs) return;

        // Gain XP: 15-25 range
        const baseGain = Math.floor(Math.random() * 11) + 15;
        await addXp(message.guild, message.member, baseGain, 'message', message.channel);
    } catch (err) {
        logger.error(`[Leveling] Error in handleMessageXp for ${userId}:`, err);
    }
};
