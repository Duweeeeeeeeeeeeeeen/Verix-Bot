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
    const { modules = [], adminRoles, staffRole, language, prefix, nickname, ticketCategory, welcomeStyle } = onboardingData;

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
                    { customId: 'start_wl', label: language === 'it' ? 'Inizia Candidatura' : language === 'es' ? 'Iniciar Solicitud' : language === 'fr' ? 'Démarrer Candidature' : 'Start Application', emoji: '⚖️', style: 'PRIMARY', enabled: true },
                    { customId: 'confirm_wl', label: language === 'it' ? 'Conferma' : language === 'es' ? 'Confirmar' : language === 'fr' ? 'Confirmer' : 'Confirm', emoji: '✅', style: 'SUCCESS', enabled: true },
                    { customId: 'cancel_wl', label: language === 'it' ? 'Annulla' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : 'Cancel', emoji: '❌', style: 'DANGER', enabled: true }
                ],
                'ui.ticketButtons': [
                    { customId: 'tk_claim', label: language === 'it' ? 'Assumi' : language === 'es' ? 'Reclamar' : language === 'fr' ? 'Réclamer' : 'Claim', emoji: '🙋‍♂️', style: 'SUCCESS', enabled: true },
                    { customId: 'tk_close', label: language === 'it' ? 'Chiudi' : language === 'es' ? 'Cerrar' : language === 'fr' ? 'Fermer' : 'Close', emoji: '🔒', style: 'DANGER', enabled: true },
                    { customId: 'tk_quick_reply', label: language === 'it' ? 'Risposte Rapide' : language === 'es' ? 'Respuestas Rápidas' : language === 'fr' ? 'Réponses Rapides' : 'Quick Replies', emoji: '📝', style: 'PRIMARY', enabled: true },
                    { customId: 'tk_tag', label: language === 'it' ? 'Tagga' : language === 'es' ? 'Etiquetar' : language === 'fr' ? 'Taguer' : 'Tag', emoji: '🏷️', style: 'SECONDARY', enabled: true },
                    { customId: 'tk_transcript', label: 'Logs', emoji: '📄', style: 'SECONDARY', enabled: true }
                ],
                'ui.voiceButtons': [
                    { customId: 'approve_voice', label: language === 'it' ? 'Accetta' : language === 'es' ? 'Aprobar' : language === 'fr' ? 'Approuver' : 'Approve', emoji: '✅', style: 'SUCCESS', enabled: true },
                    { customId: 'deny_voice', label: language === 'it' ? 'Rifiuta' : language === 'es' ? 'Rechazar' : language === 'fr' ? 'Refuser' : 'Deny', emoji: '❌', style: 'DANGER', enabled: true },
                    { customId: 'reset_timer_voice', label: language === 'it' ? 'Riavvia Timer' : language === 'es' ? 'Reiniciar Temporizador' : language === 'fr' ? 'Réinitialiser le Minuteur' : 'Reset Timer', emoji: '⏱️', style: 'SECONDARY', enabled: true }
                ],
                'naming.voiceChannel': language === 'it' ? 'candidatura-{user}' : language === 'es' ? 'solicitud-{user}' : language === 'fr' ? 'candidature-{user}' : 'apply-{user}'
            } 
        },
        { upsert: true }
    );

    // Update Nickname if provided
    if (nickname && guild.members.me.permissions.has(PermissionFlagsBits.ChangeNickname)) {
        await guild.members.me.setNickname(nickname).catch(() => {});
    }

    // 1. Giveaway
    const isGiveawayEnabled = modules.includes('giveaway');
    await GiveawayConfig.findOneAndUpdate(
        { guildId },
        { 
            $set: { 
                enabled: isGiveawayEnabled,
                ...(createdChannels.giveaway && { giveawayChannelId: createdChannels.giveaway })
            } 
        },
        { upsert: true }
    );

    // 2. Polls
    const isPollsEnabled = modules.includes('polls');
    await PollConfig.findOneAndUpdate(
        { guildId },
        { 
            $set: { 
                enabled: isPollsEnabled,
                ...(createdChannels.polls && { channelId: createdChannels.polls })
            } 
        },
        { upsert: true }
    );

    // 3. Tickets
    const isTicketsEnabled = modules.includes('tickets');
    let categoryOpenId = null;
    if (isTicketsEnabled && ticketCategory && guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
        try {
            const category = await guild.channels.create({
                name: ticketCategory,
                type: ChannelType.GuildCategory
            });
            categoryOpenId = category.id;
        } catch (err) {
            console.error('[SetupUtils] Category create error:', err);
        }
    }

    const ticketUpdate = { enabled: isTicketsEnabled };
    if (createdChannels.tickets) ticketUpdate.panelChannelId = createdChannels.tickets;
    if (staffRole) ticketUpdate.staffRoleIds = [staffRole];
    if (categoryOpenId) ticketUpdate.categoryOpenId = categoryOpenId;

    await TicketConfig.findOneAndUpdate(
        { guildId },
        { $set: ticketUpdate },
        { upsert: true }
    );

    // 4. Verify
    const isVerifyEnabled = modules.includes('verify');
    await VerifyConfig.findOneAndUpdate(
        { guildId },
        { 
            $set: { 
                enabled: isVerifyEnabled,
                ...(createdChannels.verify && { channelId: createdChannels.verify })
            } 
        },
        { upsert: true }
    );

    // 5. Whitelist (Staff Role)
    const isWhitelistEnabled = modules.includes('whitelist');
    await WhitelistConfig.findOneAndUpdate(
        { guildId },
        { 
            $set: { 
                enabled: isWhitelistEnabled,
                ...(staffRole && { staffRoleIds: [staffRole] })
            } 
        },
        { upsert: true }
    );

    // 6. Welcome (Style)
    const isWelcomeEnabled = modules.includes('welcome');
    await WelcomeConfig.findOneAndUpdate(
        { guildId },
        { 
            $set: { 
                enabled: isWelcomeEnabled,
                ...(welcomeStyle && { useEmbed: welcomeStyle === 'embed' })
            } 
        },
        { upsert: true }
    );

    // 7. Logs
    if (createdChannels.logs) {
        await Guild.findOneAndUpdate(
            { guildId },
            { $set: { logChannelId: createdChannels.logs } }
        );
    }
}
