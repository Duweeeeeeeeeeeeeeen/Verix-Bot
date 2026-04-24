import { Events, PermissionFlagsBits } from 'discord.js';
import ModerationConfig from '../../../models/ModerationConfig.js';
import logger from '../../../utils/logger.js';
import { handleUserInfraction } from '../../../utils/punishmentManager.js';

// In-memory tracker for Anti-Spam: guildId:userId -> [timestamps]
const userMessages = new Map();

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Ignore bots and DMs
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const member = message.member;

        // Fetch config
        const config = await ModerationConfig.findOne({ guildId });
        if (!config || !config.enabled) return;

        // 1. Check Exceptions (Administrator, Whitelisted Roles/Channels)
        if (member.permissions.has(PermissionFlagsBits.Administrator)) return;
        if (config.ignoredRoles?.some(roleId => member.roles.cache.has(roleId))) return;
        if (config.ignoredChannels?.includes(message.channel.id)) return;

        let violation = false;
        let violationReason = '';

        // --- 2. ANTI SPAM ---
        if (config.antispam?.enabled) {
            const now = Date.now();
            const userKey = `${guildId}:${userId}`;
            
            if (!userMessages.has(userKey)) userMessages.set(userKey, []);
            const timestamps = userMessages.get(userKey);
            timestamps.push(now);

            const windowStart = now - config.antispam.timeWindow;
            const recentMessages = timestamps.filter(ts => ts > windowStart);
            userMessages.set(userKey, recentMessages);

            if (recentMessages.length > config.antispam.maxMessages) {
                violation = true;
                violationReason = 'stai inviando messaggi troppo velocemente';
            }
        }

        // --- 3. CAPS LOCK ---
        if (!violation && config.capsLock?.enabled && message.content.length >= config.capsLock.minCharacters) {
            const capsCount = message.content.replace(/[^A-Z]/g, "").length;
            const percentage = (capsCount / message.content.length) * 100;

            if (percentage >= config.capsLock.percentage) {
                violation = true;
                violationReason = 'stai usando troppe maiuscole';
            }
        }

        // --- 4. MENTION SPAM ---
        if (!violation && config.mentionSpam?.enabled) {
            const mentionCount = message.mentions.users.size + message.mentions.roles.size;
            if (mentionCount > config.mentionSpam.limit) {
                violation = true;
                violationReason = 'stai menzionando troppe persone';
            }
        }

        // --- 5. BLACKLIST ---
        if (!violation && config.blacklist?.enabled && config.blacklist.words?.length > 0) {
            const content = message.content.toLowerCase();
            const blacklisted = config.blacklist.words.some(word => content.includes(word.toLowerCase()));
            
            if (blacklisted) {
                violation = true;
                violationReason = 'hai usato parole non consentite';
            }
        }

        // 6. ACTION
        if (violation) {
            try {
                // Delete message
                if (message.deletable) await message.delete().catch(() => {});

                // Trigger Progressive Punishment
                await handleUserInfraction(member, violationReason, message.channel);

                logger.info(`[Moderation] Violation in ${message.guild.name}: ${violationReason} by ${message.author.tag}`);
            } catch (error) {
                logger.error('[Moderation] Error handling violation:', error);
            }
        }
    }
};
