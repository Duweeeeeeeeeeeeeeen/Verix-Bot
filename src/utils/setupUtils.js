import { ChannelType, PermissionFlagsBits } from 'discord.js';
import Guild from '../models/Guild.js';
import GlobalConfig from '../models/GlobalConfig.js';
import GiveawayConfig from '../models/GiveawayConfig.js';
import TicketConfig from '../models/TicketConfig.js';
import PollConfig from '../models/PollConfig.js';
import VerifyConfig from '../models/VerifyConfig.js';
import WhitelistConfig from '../models/WhitelistConfig.js';
import WelcomeConfig from '../models/WelcomeConfig.js';
import { getDefaultMessages } from '../locales/t.js';

/**
 * Creates default channels for selected modules.
 * @param {import('discord.js').Guild} guild 
 * @param {string[]} modules 
 * @param {Object} customNames
 * @param {string} language
 */
export async function createDefaultChannels(guild, modules, customNames = {}, language = 'en') {
    const createdChannels = {};

    const moduleChannels = [
        { id: 'whitelist', defaultName: language === 'it' ? '⚖️-candidature' : '⚖️-applications', type: ChannelType.GuildText },
        { id: 'tickets', defaultName: language === 'it' ? '🎫-apri-ticket' : '🎫-open-ticket', type: ChannelType.GuildText },
        { id: 'verify', defaultName: language === 'it' ? '✅-verifica' : '✅-verification', type: ChannelType.GuildText },
        { id: 'polls', defaultName: language === 'it' ? '📊-sondaggi' : '📊-polls', type: ChannelType.GuildText },
        { id: 'giveaway', defaultName: '🎉-giveaways', type: ChannelType.GuildText },
        { id: 'photocontest', defaultName: language === 'it' ? '📸-foto-contest' : '📸-photo-contest', type: ChannelType.GuildText },
        { id: 'logs', defaultName: '📜-verix-logs', type: ChannelType.GuildText }
    ];

    for (const mod of moduleChannels) {
        if (modules.includes(mod.id) || mod.id === 'logs') {
            try {
                const finalName = customNames[mod.id] || mod.defaultName;
                // Check if channel already exists
                let channel = guild.channels.cache.find(c => c.name === finalName && c.type === mod.type);
                if (!channel) {
                    channel = await guild.channels.create({
                        name: finalName,
                        type: mod.type,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                allow: [PermissionFlagsBits.ViewChannel],
                                deny: mod.id === 'logs' ? [PermissionFlagsBits.ViewChannel] : []
                            }
                        ]
                    });
                }
                createdChannels[mod.id] = channel.id;
            } catch (err) {
                console.error(`[SetupUtils] Error creating channel ${mod.name}:`, err);
            }
        }
    }

    return createdChannels;
}

/**
 * Initializes module configurations with the created channels and roles.
 * @param {string} guildId 
 * @param {Object} createdChannels 
 * @param {Object} onboardingData (adminRoles, staffRole, language, prefix, nickname, ticketCategory, welcomeStyle)
 * @param {import('discord.js').Guild} guild
 */
export async function initializeModuleConfigs(guildId, createdChannels, onboardingData = {}, guild) {
    const { adminRoles, staffRole, language, prefix, nickname, ticketCategory, welcomeStyle } = onboardingData;

    // 0. Global & Guild Core
    await Guild.findOneAndUpdate(
        { guildId },
        { $set: { 
            prefix: prefix || '!',
            setupCompleted: true,
            customBotName: nickname || null
        } }
    );

    const messages = getDefaultMessages(language || 'en');

    await GlobalConfig.findOneAndUpdate(
        { guildId },
        { 
            $set: { 
                adminRoleIds: adminRoles || [],
                language: language || 'en',
                'ui.whitelistButtons': [
                    { customId: 'start_wl', label: language === 'it' ? 'Inizia Candidatura' : 'Start Application', emoji: '⚖️', style: 'PRIMARY', enabled: true },
                    { customId: 'confirm_wl', label: language === 'it' ? 'Conferma' : 'Confirm', emoji: '✅', style: 'SUCCESS', enabled: true },
                    { customId: 'cancel_wl', label: language === 'it' ? 'Annulla' : 'Cancel', emoji: '❌', style: 'DANGER', enabled: true }
                ],
                'ui.ticketButtons': [
                    { customId: 'tk_claim', label: language === 'it' ? 'Assumi' : 'Claim', emoji: '🙋‍♂️', style: 'SUCCESS', enabled: true },
                    { customId: 'tk_close', label: language === 'it' ? 'Chiudi' : 'Close', emoji: '🔒', style: 'DANGER', enabled: true },
                    { customId: 'tk_quick_reply', label: language === 'it' ? 'Risposte Rapide' : 'Quick Replies', emoji: '📝', style: 'PRIMARY', enabled: true },
                    { customId: 'tk_tag', label: language === 'it' ? 'Tagga' : 'Tag', emoji: '🏷️', style: 'SECONDARY', enabled: true },
                    { customId: 'tk_transcript', label: 'Logs', emoji: '📄', style: 'SECONDARY', enabled: true }
                ],
                'ui.voiceButtons': [
                    { customId: 'approve_voice', label: language === 'it' ? 'Accetta' : 'Approve', emoji: '✅', style: 'SUCCESS', enabled: true },
                    { customId: 'deny_voice', label: language === 'it' ? 'Rifiuta' : 'Deny', emoji: '❌', style: 'DANGER', enabled: true },
                    { customId: 'reset_timer_voice', label: language === 'it' ? 'Riavvia Timer' : 'Reset Timer', emoji: '⏱️', style: 'SECONDARY', enabled: true }
                ],
                'naming.voiceChannel': language === 'it' ? 'candidatura-{user}' : 'apply-{user}'
            } 
        },
        { upsert: true }
    );

    // Update Nickname if provided
    if (nickname && guild.members.me.permissions.has(PermissionFlagsBits.ChangeNickname)) {
        await guild.members.me.setNickname(nickname).catch(() => {});
    }

    // 1. Giveaway
    if (createdChannels.giveaway) {
        await GiveawayConfig.findOneAndUpdate(
            { guildId },
            { $set: { giveawayChannelId: createdChannels.giveaway, enabled: true } },
            { upsert: true }
        );
    }

    // 2. Polls
    if (createdChannels.polls) {
        await PollConfig.findOneAndUpdate(
            { guildId },
            { $set: { channelId: createdChannels.polls, enabled: true } },
            { upsert: true }
        );
    }

    // 3. Tickets
    let categoryId = null;
    if (ticketCategory && guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        try {
            const category = await guild.channels.create({
                name: ticketCategory,
                type: ChannelType.GuildCategory
            });
            categoryId = category.id;
        } catch (err) {
            console.error('[SetupUtils] Category create error:', err);
        }
    }

    if (createdChannels.tickets || staffRole || categoryId) {
        const update = { enabled: true };
        if (createdChannels.tickets) update.panelChannelId = createdChannels.tickets;
        if (staffRole) update.staffRoleId = staffRole;
        if (categoryId) update.categoryId = categoryId;

        await TicketConfig.findOneAndUpdate(
            { guildId },
            { $set: update },
            { upsert: true }
        );
    }

    // 4. Verify
    if (createdChannels.verify) {
        await VerifyConfig.findOneAndUpdate(
            { guildId },
            { $set: { panelChannelId: createdChannels.verify, enabled: true } },
            { upsert: true }
        );
    }

    // 5. Whitelist (Staff Role)
    if (staffRole) {
        await WhitelistConfig.findOneAndUpdate(
            { guildId },
            { $set: { staffRoleId: staffRole, enabled: true } },
            { upsert: true }
        );
    }

    // 6. Welcome (Style)
    if (welcomeStyle) {
        await WelcomeConfig.findOneAndUpdate(
            { guildId },
            { $set: { 
                enabled: true,
                useEmbed: welcomeStyle === 'embed'
            } },
            { upsert: true }
        );
    }

    // 7. Logs
    if (createdChannels.logs) {
        await Guild.findOneAndUpdate(
            { guildId },
            { $set: { logChannelId: createdChannels.logs } }
        );
    }
}
