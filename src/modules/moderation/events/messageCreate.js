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
        let shouldDelete = true;

        const content = message.content;

        // --- 2. ANTI SPAM (Messages Frequency) ---
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

        // --- 3. ANTI FLOOD (Walltext / Lines / Emojis) ---
        if (!violation && config.antiFlood?.enabled) {
            // Line count
            const lineCount = content.split('\n').length;
            if (lineCount > config.antiFlood.maxLines) {
                violation = true;
                violationReason = 'il tuo messaggio contiene troppe righe';
            }

            // Character count
            if (!violation && content.length > config.antiFlood.maxCharacters) {
                violation = true;
                violationReason = 'il tuo messaggio è troppo lungo';
            }

            // Emoji count
            if (!violation) {
                const emojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>|[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
                const emojiCount = (content.match(emojiRegex) || []).length;
                if (emojiCount > config.antiFlood.maxEmojis) {
                    violation = true;
                    violationReason = 'il tuo messaggio contiene troppe emoji';
                }
            }
        }

        // --- 4. ANTI LINK ---
        if (!violation && config.antiLink?.enabled) {
            // Check exemptions for this sub-module
            const isExempt = config.antiLink.allowRoles?.some(r => member.roles.cache.has(r)) || 
                           config.antiLink.allowChannels?.includes(message.channel.id);
            
            if (!isExempt) {
                const urlRegex = /(https?:\/\/[^\s]+)/gi;
                const matches = content.match(urlRegex);
                
                if (matches) {
                    // Check whitelist
                    const allLinksWhitelisted = matches.every(link => {
                        try {
                            const domain = new URL(link).hostname.toLowerCase().replace('www.', '');
                            return config.antiLink.whitelist?.some(d => domain === d.toLowerCase().replace('www.', ''));
                        } catch { return false; }
                    });

                    if (!allLinksWhitelisted) {
                        violation = true;
                        violationReason = 'non è consentito inviare link esterni';
                    }
                }
            }
        }

        // --- 5. ANTI INVITE ---
        if (!violation && config.antiInvite?.enabled) {
            const isExempt = config.antiInvite.allowRoles?.some(r => member.roles.cache.has(r)) || 
                           config.antiInvite.allowChannels?.includes(message.channel.id);

            if (!isExempt) {
                const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
                if (inviteRegex.test(content)) {
                    violation = true;
                    violationReason = 'non è consentito inviare inviti Discord';
                }
            }
        }

        // --- 6. ANTI EVERYONE ---
        if (!violation && config.antiEveryone?.enabled) {
            if (message.mentions.everyone) {
                if (config.antiEveryone.action === 'delete') {
                    violation = true;
                    violationReason = 'non puoi menzionare @everyone o @here';
                } else if (config.antiEveryone.action === 'warn') {
                    violation = true;
                    violationReason = 'richiamo per menzione di massa';
                }
                // if 'none', we do nothing
            }
        }

        // --- 7. CAPS LOCK ---
        if (!violation && config.capsLock?.enabled && content.length >= config.capsLock.minCharacters) {
            const capsCount = content.replace(/[^A-Z]/g, "").length;
            const percentage = (capsCount / content.length) * 100;

            if (percentage >= config.capsLock.percentage) {
                violation = true;
                violationReason = 'stai usando troppe maiuscole';
            }
        }

        // --- 8. MENTION SPAM ---
        if (!violation && config.mentionSpam?.enabled) {
            const mentionCount = message.mentions.users.size + message.mentions.roles.size;
            if (mentionCount > config.mentionSpam.limit) {
                violation = true;
                violationReason = 'stai menzionando troppe persone';
            }
        }

        // --- 9. BLACKLIST ---
        if (!violation && config.blacklist?.enabled && config.blacklist.words?.length > 0) {
            const lowerContent = content.toLowerCase();
            const blacklisted = config.blacklist.words.some(word => lowerContent.includes(word.toLowerCase()));
            
            if (blacklisted) {
                violation = true;
                violationReason = 'hai usato parole non consentite';
            }
        }

        // 10. ACTION
        if (violation) {
            try {
                // Delete message
                if (shouldDelete && message.deletable) {
                    await message.delete().catch(() => {});
                }

                // Trigger Progressive Punishment
                await handleUserInfraction(member, violationReason, message.channel);

                logger.info(`[Moderation] Violation in ${message.guild.name}: ${violationReason} by ${message.author.tag}`);
            } catch (error) {
                logger.error('[Moderation] Error handling violation:', error);
            }
        }
    }
};
