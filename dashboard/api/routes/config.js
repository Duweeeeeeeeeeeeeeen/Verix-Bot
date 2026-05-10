import express from 'express';
import { z } from 'zod';
import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';


import WhitelistConfig from '../../../src/models/WhitelistConfig.js';
import TicketConfig from '../../../src/models/TicketConfig.js';
import Guild from '../../../src/models/Guild.js';
import Ticket from '../../../src/models/Ticket.js';
import WhitelistApp from '../../../src/models/WhitelistApp.js';
import VoiceQueue from '../../../src/models/VoiceQueue.js';
import PhotoContestConfig from '../../../src/models/PhotoContestConfig.js';
import TempVoiceConfig from '../../../src/models/TempVoiceConfig.js';
import GiveawayConfig from '../../../src/models/GiveawayConfig.js';
import Giveaway from '../../../src/models/Giveaway.js';
import Poll from '../../../src/models/Poll.js';
import PhotoContest from '../../../src/models/PhotoContest.js';
import VerifyConfig from '../../../src/models/VerifyConfig.js';
import GlobalConfig from '../../../src/models/GlobalConfig.js';
import FiveMConfig from '../../../src/models/FiveMConfig.js';
import DashboardAuditLog from '../../../src/models/DashboardAuditLog.js';
import WelcomeConfig from '../../../src/models/WelcomeConfig.js';
import UtilityConfig from '../../../src/models/UtilityConfig.js';
import BackgroundConfig from '../../../src/models/BackgroundConfig.js';
import SocialConfig from '../../../src/models/SocialConfig.js';
import AutoClearConfig from '../../../src/models/AutoClearConfig.js';
import AutomationConfig from '../../../src/models/AutomationConfig.js';
import ModerationConfig from '../../../src/models/ModerationConfig.js';
import SupportConfig from '../../../src/models/SupportConfig.js';
import ReactionRoleConfig from '../../../src/models/ReactionRoleConfig.js';
import PollConfig from '../../../src/models/PollConfig.js';

import { getButtonStyle } from '../../../src/utils/uiBuilder.js';
import multiBotManager from '../../../src/core/multiBotManager.js';
import { mergeModuleDefaults } from '../utils/mergeDefaults.js';
import { adminCheck } from '../middleware/adminCheck.js';
import { checkBotPermissions } from '../../../src/utils/permissionHelper.js';
import { invalidateCache } from '../../../src/core/configCache.js';
import { invalidateGlobalCache } from '../../../src/core/globalConfigManager.js';
import { buildButtonRows } from '../../../src/utils/uiBuilder.js';
import messageService from '../../../src/utils/messageService.js';
import placeholderHelper from '../../../src/utils/placeholderHelper.js';
import * as whiteLabelHelper from '../../../src/utils/whiteLabelHelper.js';
import { createDefaultChannels, initializeModuleConfigs } from '../../../src/utils/setupUtils.js';

// Centralized Utilities
import { validate } from '../middleware/validate.js';
import { logAudit } from '../utils/auditLogger.js';

// Validations
import { whitelistSchema } from '../validations/whitelistSchema.js';
import { ticketSchema } from '../validations/ticketSchema.js';
import { photoContestSchema } from '../validations/photoContestSchema.js';
import { verifySchema } from '../validations/verifySchema.js';
import { guildSchema } from '../validations/guildSchema.js';
import { globalConfigSchema } from '../validations/globalConfigSchema.js';
import { welcomeSchema } from '../validations/welcomeSchema.js';
import { fivemSchema } from '../validations/fivemSchema.js';
import { utilitySchema } from '../validations/utilitySchema.js';
import { backgroundSchema } from '../validations/backgroundSchema.js';
import { socialSchema } from '../validations/socialSchema.js';
import { onboardingSchema } from '../validations/onboardingSchema.js';
import { moderationSchema } from '../validations/moderationSchema.js';
import { supportSchema } from '../validations/supportSchema.js';
import { reactionRoleSchema } from '../validations/reactionRoleSchema.js';
import { pollConfigSchema, pollCreateSchema } from '../validations/pollSchema.js';



const router = express.Router();
 
// MiddleWare to resolve the correct Discord Client (Main or Private Bot)
router.use('/:guildId', (req, res, next) => {
    const { guildId } = req.params;
    if (guildId && multiBotManager.instances.has(guildId)) {
        req.discordClient = multiBotManager.instances.get(guildId);
        // console.log(`[Dashboard_API] Using Private Bot for guild: ${guildId}`);
    } else {
        // console.log(`[Dashboard_API] Using Main Bot for guild: ${guildId}`);
    }
    next();
});

// GET all configs for a guild
router.get('/:guildId', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        
        // Fetch or create all configurations atomically in parallel using upsert
        let [wlConfig, tkConfig, photoConfig, verifyConfig, guildData, globalConfig, wlcmConfig, utilConfig, fmConfig, socConfig, autoClearConfig, modConfig, suppConfig, rrConfig, pollConfig] = await Promise.all([
            WhitelistConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            TicketConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            PhotoContestConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            VerifyConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            Guild.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            GlobalConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            WelcomeConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            UtilityConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            FiveMConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            SocialConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            AutoClearConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            ModerationConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            SupportConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            ReactionRoleConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }),
            PollConfig.findOneAndUpdate({ guildId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
        ]);

        // Fetch roles and channels from Discord Client with fallback
        let client = req.discordClient;
        let roles = [];
        let channels = [];
        let guild = null;
        
        try {
            guild = await client.guilds.fetch(guildId).catch(() => null);
            
            // FALLBACK: If Private Bot is not in guild, try Main Bot
            if (!guild && client !== req.mainClient) {
                console.log(`[Dashboard_API] Private bot ${client.user?.tag} not in guild ${guildId}. Falling back to Main Bot for overview.`);
                client = req.mainClient;
                guild = await client.guilds.fetch(guildId).catch(() => null);
            }

            if (guild) {
                roles = (await guild.roles.fetch()).map(r => ({ id: r.id, name: r.name, color: r.hexColor }));
                channels = (await guild.channels.fetch()).map(c => ({ id: c.id, name: c.name, type: c.type }));
            }
        } catch (discordError) {
            console.error('Error fetching Discord data for guild:', discordError);
        }

        const lang = globalConfig?.language || 'it';
        const discordGuild = guild;

        res.json({
            success: true,
            data: {
                whitelist: mergeModuleDefaults('whitelist', wlConfig, lang),
                tickets: mergeModuleDefaults('tickets', tkConfig, lang),
                photocontest: mergeModuleDefaults('photocontest', photoConfig, lang),
                verify: mergeModuleDefaults('verify', verifyConfig, lang),
                guild: guildData,
                guildName: discordGuild?.name || guildData?.guildName || 'Verix Server',
                guildIcon: discordGuild?.iconURL({ dynamic: true, size: 256 }) || null,
                isPremium: guildData?.isPremium || ['premium', 'platinum'].includes(guildData?.premiumTier),
                premiumTier: guildData?.premiumTier || (guildData?.isPremium ? 'premium' : 'none'),
                mainBotMissing: !req.mainClient.guilds.cache.has(guildId),
                mainBotInviteUrl: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}`,
                globalConfig,
                welcome: mergeModuleDefaults('welcome', wlcmConfig, lang),
                utility: mergeModuleDefaults('utility', utilConfig, lang),
                fivem: mergeModuleDefaults('fivem', fmConfig, lang),
                socials: socConfig,
                autoclear: autoClearConfig,
                moderation: mergeModuleDefaults('moderation', modConfig, lang),
                support: mergeModuleDefaults('support', suppConfig, lang),
                reactionRoles: rrConfig,
                polls: pollConfig,
                roles,
                channels
            }
        });

    } catch (error) {
        console.error('Error fetching configurations:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare le impostazioni. Verifica la connessione al database o ricarica la pagina.' });
    }
});

// GET guild info (Premium status, name, etc.)
router.get('/:guildId/guild', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOneAndUpdate(
            { guildId },
            {},
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        res.json({ success: true, data: guild });
    } catch (error) {
        console.error('Error fetching guild info:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare le info del server' });
    }
});

// GET whitelist config
router.get('/:guildId/whitelist', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await WhitelistConfig.findOne({ guildId });
        
        if (!config) {
            config = await WhitelistConfig.create({ guildId });
        }
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('whitelist', config, lang) });
    } catch (error) {
        console.error('Error fetching whitelist configuration:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione whitelist' });
    }
});

// GET automation config
router.get('/:guildId/automations', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await AutomationConfig.findOne({ guildId });
        
        if (!config) {
            // Migration attempt from old AutoClearConfig
            const oldAutoClear = await AutoClearConfig.findOne({ guildId });
            if (oldAutoClear) {
                config = await AutomationConfig.create({
                    guildId,
                    autoClear: {
                        enabled: true,
                        slots: oldAutoClear.slots
                    },
                    autoMessage: { enabled: true, slots: [] }
                });
            } else {
                config = await AutomationConfig.create({ 
                    guildId, 
                    autoClear: { enabled: true, slots: [] },
                    autoMessage: { enabled: true, slots: [] }
                });
            }
        }
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error fetching automations:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare le automazioni' });
    }
});

// POST automation config
router.post('/:guildId/automations', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { autoClear, autoMessage } = req.body;

        const isPremium = (await Guild.findOne({ guildId }))?.isPremium;

        if (!isPremium) {
            if ((autoClear?.slots || []).length > 5) {
                return res.status(403).json({ success: false, error: 'Free tier limit: 5 Auto-Clear slots. Upgrade to PRO for more.' });
            }
            if ((autoMessage?.slots || []).length > 5) {
                return res.status(403).json({ success: false, error: 'Free tier limit: 5 Auto-Message slots. Upgrade to PRO for more.' });
            }
        }

        const config = await AutomationConfig.findOneAndUpdate(
            { guildId },
            { $set: { autoClear, autoMessage } },
            { returnDocument: 'after', upsert: true }
        );

        await logAudit(req, guildId, 'automations_update', 'Automations Config Updated');
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating automations:', error);
        res.status(500).json({ success: false, error: 'Impossibile salvare le automazioni' });
    }
});

// Alias for legacy autoclear route
router.get('/:guildId/autoclear', adminCheck, async (req, res) => {
    res.redirect(`/api/config/${req.params.guildId}/automations`);
});

// GET tempvoice config
router.get('/:guildId/tempvoice', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await TempVoiceConfig.findOne({ guildId });
        if (!config) config = await TempVoiceConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('tempvoice', config, lang) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione vocale' });
    }
});

// POST tempvoice config
router.post('/:guildId/tempvoice', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const updateData = req.body;

        // Conflict check: if this channel is used for Whitelist or Support Voice, clear it there
        if (updateData.creatorChannelId) {
            // Check Whitelist
            const wlConfig = await WhitelistConfig.findOne({ guildId });
            if (wlConfig && wlConfig.voiceSettings?.joinChannelId === updateData.creatorChannelId) {
                wlConfig.voiceSettings.joinChannelId = null;
                await wlConfig.save();
                invalidateCache(guildId, 'whitelist');
            }

            // Check Support
            const suppConfig = await SupportConfig.findOne({ guildId });
            if (suppConfig && suppConfig.voiceSettings?.joinChannelId === updateData.creatorChannelId) {
                suppConfig.voiceSettings.joinChannelId = null;
                await suppConfig.save();
                invalidateCache(guildId, 'support');
            }
        }

        const config = await TempVoiceConfig.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { returnDocument: 'after', upsert: true }
        );

        invalidateCache(guildId, 'tempvoice');
        await logAudit(req, 'UPDATE_TEMPVOICE', updateData);

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating tempvoice config:', error);
        res.status(500).json({ success: false, error: 'Impossibile salvare la configurazione vocale' });
    }
});

// GET giveaway config
router.get('/:guildId/giveaway', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await GiveawayConfig.findOne({ guildId });
        if (!config) config = await GiveawayConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('giveaway', config, lang) });
    } catch (error) {
        console.error('[Giveaway] Config GET Error:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione giveaway' });
    }
});

// POST giveaway config
router.post('/:guildId/giveaway', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await GiveawayConfig.findOneAndUpdate(
            { guildId },
            { $set: req.body },
            { returnDocument: 'after', upsert: true }
        );
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile salvare la configurazione giveaway' });
    }
});

// GET active giveaways
router.get('/:guildId/giveaways/active', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const active = await Giveaway.find({ guildId, status: 'ACTIVE' }).sort({ endTime: -1 });
        res.json({ success: true, data: active });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare i giveaway attivi' });
    }
});

// GET giveaway logs (ended)
router.get('/:guildId/giveaways/logs', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const logs = await Giveaway.find({ guildId, status: 'ENDED' })
            .select('prize winnerCount participants winners endTime status')
            .sort({ endTime: -1 })
            .limit(20);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare i log dei giveaway' });
    }
});

// GET scheduled giveaways
router.get('/:guildId/giveaways/scheduled', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const scheduled = await Giveaway.find({ guildId, status: 'SCHEDULED' }).sort({ startTime: 1 });
        res.json({ success: true, data: scheduled });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare i giveaway programmati' });
    }
});

// POST create giveaway from dashboard
router.post('/:guildId/giveaways/create', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { prize, duration, winnerCount, channelId, scheduledStart, customTitle, customDescription, color, buttonLabel, buttonEmoji, buttonStyle } = req.body;
        const client = req.discordClient;

        const startTime = scheduledStart ? new Date(scheduledStart) : new Date();
        const durationMs = 1000 * 60 * (parseInt(duration) || 60);
        const endTime = new Date(startTime.getTime() + durationMs);

        // If not scheduled (start now), send message immediately
        if (!scheduledStart || startTime <= new Date()) {
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (!channel) return res.status(400).json({ success: false, error: 'Canale non trovato' });

            const title = customTitle || `🎉 GIVEAWAY: ${prize}`;
            let description = customDescription || `Clicca il tasto qui sotto per partecipare!\n\n⌛ **Termina:** <t:${Math.floor(endTime.getTime() / 1000)}:R>`;
            
            // Global placeholder replacement
            description = placeholderHelper.replace(description, {
                prize: prize,
                endtime: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`
            });

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .addFields({ name: '👥 Partecipanti', value: '0', inline: true })
                .setColor(color || '#5865F2')
                .setTimestamp(endTime)
                .setFooter({ text: 'Termina il' });

            const styleMap = {
                'PRIMARY': ButtonStyle.Primary,
                'SUCCESS': ButtonStyle.Success,
                'DANGER': ButtonStyle.Danger,
                'SECONDARY': ButtonStyle.Secondary
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gw_join_${Date.now()}`)
                        .setLabel(buttonLabel || 'Partecipa')
                        .setEmoji(buttonEmoji || '🎉')
                        .setStyle(styleMap[buttonStyle] || ButtonStyle.Primary)
                );

            const msg = await channel.send({ embeds: [embed], components: [row] });

            const giveaway = await Giveaway.create({
                guildId,
                channelId,
                messageId: msg.id,
                prize,
                winnerCount: parseInt(winnerCount) || 1,
                startTime,
                endTime,
                hostId: req.user.id,
                status: 'ACTIVE',
                customTitle,
                customDescription,
                color,
                buttonLabel,
                buttonEmoji,
                buttonStyle
            });

            return res.json({ success: true, data: giveaway });
        } else {
            // Scheduled for future
            const giveaway = await Giveaway.create({
                guildId,
                channelId,
                prize,
                winnerCount: parseInt(winnerCount) || 1,
                startTime,
                endTime,
                hostId: req.user.id,
                status: 'SCHEDULED',
                customTitle,
                customDescription,
                color,
                buttonLabel,
                buttonEmoji,
                buttonStyle
            });

            return res.json({ success: true, data: giveaway, scheduled: true });
        }
    } catch (error) {
        console.error('[Giveaway] Create error:', error);
        res.status(500).json({ success: false, error: 'Errore durante la creazione del giveaway' });
    }
});

// DELETE giveaway (cancel/delete)
router.delete('/:guildId/giveaways/:messageId', adminCheck, async (req, res) => {
    try {
        const { guildId, messageId } = req.params;
        // Search by messageId (active) OR _id (scheduled)
        const giveaway = await Giveaway.findOne({ 
            guildId, 
            $or: [{ messageId: messageId }, { _id: messageId.length === 24 ? messageId : null }] 
        });
        if (!giveaway) return res.status(404).json({ success: false, error: 'Giveaway non trovato' });

        const client = req.discordClient;
        const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
        if (channel) {
            const msg = await channel.messages.fetch(messageId).catch(() => null);
            if (msg) await msg.delete().catch(() => null);
        }

        await Giveaway.deleteOne({ _id: giveaway._id });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore durante l\'eliminazione' });
    }
});

// POST remove participant
router.post('/:guildId/giveaways/:messageId/remove-participant', adminCheck, async (req, res) => {
    try {
        const { guildId, messageId } = req.params;
        const { userId } = req.body;

        const giveaway = await Giveaway.findOne({ guildId, messageId });
        if (!giveaway) return res.status(404).json({ success: false, error: 'Giveaway non trovato' });

        giveaway.participants = giveaway.participants.filter(id => id !== userId);
        await giveaway.save();

        // Update Discord message
        const client = req.discordClient;
        const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
        if (channel) {
            const msg = await channel.messages.fetch(messageId).catch(() => null);
            if (msg && msg.embeds[0]) {
                const embed = EmbedBuilder.from(msg.embeds[0]);
                embed.setFields({ name: '👥 Partecipanti', value: `${giveaway.participants.length}`, inline: true });
                await msg.edit({ embeds: [embed] }).catch(() => null);
            }
        }

        res.json({ success: true, data: giveaway });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore durante la rimozione' });
    }
});

// POST manual clear
router.post('/:guildId/autoclear/manual', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { channelId, amount } = req.body;

        if (!channelId || !amount) {
            return res.status(400).json({ success: false, error: 'Parametri mancanti (canale o quantità).' });
        }

        const parsedAmount = parseInt(amount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, error: 'La quantità inserita non è un numero valido.' });
        }

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);

        if (!channel || !channel.isTextBased()) {
            return res.status(404).json({ success: false, error: 'Canale non trovato o non testuale.' });
        }

        const deleted = await channel.bulkDelete(Math.min(parsedAmount, 100), true);

        await logAudit(req, guildId, 'manual_clear', 'Manual Clear Executed', { channelId, amount: deleted.size });
        
        res.json({ success: true, data: { count: deleted.size } });
    } catch (error) {
        console.error('Error in manual clear:', error);
        res.status(500).json({ success: false, error: 'Impossibile eseguire la pulizia manuale. Verifica i permessi del bot.' });
    }
});

// GET background config
router.get('/:guildId/background', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await BackgroundConfig.findOne({ guildId });
        
        if (!config) {
            config = await BackgroundConfig.create({ guildId });
        }
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('background', config, lang) }); // Background uses its own defaults now
    } catch (error) {
        console.error('Error fetching background configuration:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione background' });
    }
});

// POST update background config
router.post('/:guildId/background', adminCheck, validate(backgroundSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData || req.body;

        if (data._id) delete data._id;
        if (data.__v !== undefined) delete data.__v;

        const config = await BackgroundConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_BACKGROUND', data);
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating background configuration:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST send background panel
router.post('/:guildId/background/send-panel', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { channelId } = req.body;
        const config = await BackgroundConfig.findOne({ guildId });
        
        const targetChannelId = channelId || config?.panelChannelId;
        
        if (!targetChannelId) {
            return res.status(400).json({ success: false, error: 'Canale non specificato.' });
        }

        const panelData = await messageService.getRaw(guildId, 'background', 'panel');

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(targetChannelId);

        if (!channel) {
            return res.status(404).json({ success: false, error: 'Canale non trovato su Discord.' });
        }

        const embed = new EmbedBuilder()
            .setTitle(panelData.title)
            .setDescription(panelData.description)
            .setColor(panelData.color === 'primary' ? '#5865F2' : (panelData.color?.startsWith('#') ? panelData.color : '#5865F2'));

        if (panelData.thumbnail) embed.setThumbnail(panelData.thumbnail);
        if (panelData.image) embed.setImage(panelData.image);

        // Background Submission Button
        const btnData = config?.embeds?.panel?.button || { label: 'Invia Background', emoji: '📖', style: 'PRIMARY' };
        const submitButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_bg')
                .setLabel(btnData.label || 'Invia Background')
                .setStyle(getButtonStyle(btnData.style))
                .setEmoji(btnData.emoji || '📖')
        );

        // Purge old panels
        try {
            const messages = await channel.messages.fetch({ limit: 20 });
            const legacy = messages.filter(m => 
                m.author.id === client.user.id && 
                m.components.some(row => row.components.some(c => c.customId === 'start_background'))
            );
            for (const m of legacy.values()) await m.delete().catch(() => {});
        } catch (err) {
            console.error('Purge error:', err);
        }

        const sentMessage = await channel.send({ embeds: [embed], components: [submitButton] });

        await BackgroundConfig.updateOne({ guildId }, { $set: { panelMessageId: sentMessage.id } });

        invalidateCache(guildId);
        await logAudit(req, 'SEND_BACKGROUND_PANEL', { channelId: targetChannelId });
        res.json({ success: true, message: 'Pannello inviato correttamente!' });
    } catch (error) {
        console.error('Error sending background panel:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio del pannello.' });
    }
});

// POST update whitelist config
router.post('/:guildId/whitelist', adminCheck, validate(whitelistSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData || req.body;

        if (!data) throw new Error('Dati della richiesta mancanti o non validi.');

        // Prevent Mongoose immutable field errors
        if (data._id) delete data._id;
        if (data.__v !== undefined) delete data.__v;

        // Conflict check: if Whitelist Voice joinChannelId is set, clear it in TempVoice and Support
        const joinChannelId = data.voiceSettings?.joinChannelId;
        if (joinChannelId) {
             // Clear TempVoice
             const tempConfig = await TempVoiceConfig.findOne({ guildId });
             if (tempConfig && tempConfig.creatorChannelId === joinChannelId) {
                 tempConfig.creatorChannelId = null;
                 await tempConfig.save();
                 invalidateCache(guildId, 'tempvoice');
             }
             // Clear Support
             const suppConfig = await SupportConfig.findOne({ guildId });
             if (suppConfig && suppConfig.voiceSettings?.joinChannelId === joinChannelId) {
                 suppConfig.voiceSettings.joinChannelId = null;
                 await suppConfig.save();
                 invalidateCache(guildId, 'support');
             }
        }

        const config = await WhitelistConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        if (!config) throw new Error('Impossibile trovare o creare la configurazione.');

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_WHITELIST', data);
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('[whitelist update error]:', error.message);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio della whitelist.' });
    }
});

// POST send whitelist panel
router.post('/:guildId/whitelist/send-panel', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { channelId } = req.body;
        const config = await WhitelistConfig.findOne({ guildId });
        
        const targetChannelId = channelId || (config?.panelChannelId);
        
        if (!targetChannelId) {
            return res.status(400).json({ success: false, error: 'Canale non specificato nella richiesta e non configurato nel database.' });
        }

        const panelData = await messageService.getRaw(guildId, 'whitelist', 'panel');

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(targetChannelId);

        if (!channel) {
            return res.status(404).json({ success: false, error: 'Canale non trovato su Discord.' });
        }

        const embed = new EmbedBuilder()
            .setTitle(panelData.title)
            .setDescription(panelData.description)
            .setColor(panelData.color?.startsWith('#') ? panelData.color : '#5865F2');

        if (panelData.thumbnail) embed.setThumbnail(panelData.thumbnail);
        if (panelData.image) embed.setImage(panelData.image);
        if (panelData.fields && Array.isArray(panelData.fields)) {
            embed.addFields(panelData.fields.filter(f => f.name && f.value));
        }
        if (panelData.footer) embed.setFooter({ text: panelData.footer });

        // Whitelist Start Button
        const btnData = config?.embeds?.panel?.button || { label: 'Inizia Whitelist', emoji: '📝', style: 'PRIMARY' };
        const isLink = btnData.style === 'LINK' && btnData.url;
        
        const startButton = new ButtonBuilder()
            .setLabel(btnData.label || 'Inizia Whitelist')
            .setStyle(isLink ? ButtonStyle.Link : getButtonStyle(btnData.style))
            .setEmoji(btnData.emoji || '📝');

        if (isLink) {
            startButton.setURL(btnData.url);
        } else {
            startButton.setCustomId('start_wl');
        }

        const startButtonRow = new ActionRowBuilder().addComponents(startButton);

        // Cleanup old whitelist panels
        try {
            const messages = await channel.messages.fetch({ limit: 50 });
            const legacyPanels = messages.filter(m =>
                m.author.id === client.user.id &&
                m.components.some(row => row.components.some(c =>
                    c.customId === 'start_wl' ||
                    c.customId === 'apply_whitelist'
                ))
            );
            for (const m of legacyPanels.values()) {
                await m.delete().catch(() => {});
            }
        } catch (err) {
            console.error('[whitelist cleanup error]:', err.message);
        }

        const sentMessage = await channel.send({ embeds: [embed], components: [startButtonRow] });

        // Store new message ID and its location for next cleanup
        await WhitelistConfig.updateOne(
            { guildId },
            { 
                $set: { 
                    panelMessageId: sentMessage.id,
                    lastPanelMessageId: sentMessage.id,
                    lastPanelChannelId: targetChannelId
                } 
            }
        );

        invalidateCache(guildId);
        await logAudit(req, 'SEND_WHITELIST_PANEL', { channelId: targetChannelId, messageId: sentMessage.id });
        res.json({ success: true, message: 'Pannello inviato correttamente!' });
    } catch (error) {
        console.error('Error sending whitelist panel:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio del pannello.' });
    }
});

// GET tickets config
router.get('/:guildId/tickets', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await TicketConfig.findOne({ guildId });
        if (!config) config = await TicketConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('tickets', config, lang) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione tickets' });
    }
});

// POST update tickets config
router.post('/:guildId/tickets', adminCheck, validate(ticketSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOne({ guildId });
        const isPremium = guild?.isPremium || guild?.premiumTier === 'platinum' || guild?.premiumTier === 'premium';
        
        if (!isPremium && (req.validatedData.categories || []).length > 2) {
            return res.status(403).json({ success: false, error: 'Free tier limit: 2 Ticket Categories. Upgrade to PRO for more.' });
        }

        const config = await TicketConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
            { returnDocument: 'after', upsert: true }
        );
        
        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_TICKETS', req.validatedData);
        
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update ticket config' });
    }
});

// POST send tickets panel
router.post('/:guildId/tickets/send-panel', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await TicketConfig.findOne({ guildId });
        
        if (!config || !config.panelChannelId) {
            return res.status(400).json({ success: false, error: 'Configurazione non trovata o canale pannello non impostato.' });
        }

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(config.panelChannelId);

        if (!channel) {
            return res.status(404).json({ success: false, error: 'Canale pannello non trovato su Discord.' });
        }

        const panelData = await messageService.getRaw(guildId, 'tickets', 'panel');

        const embed = new EmbedBuilder()
            .setTitle(panelData.title || '🎫 Centro Assistenza')
            .setDescription(panelData.description || 'Apri un ticket selezionando una categoria.')
            .setColor(panelData.color?.startsWith('#') ? panelData.color : '#3498db');

        if (panelData.thumbnail) embed.setThumbnail(panelData.thumbnail);
        if (panelData.image) try { embed.setImage(panelData.image); } catch (e) {}
        if (panelData.footer) embed.setFooter({ text: panelData.footer });

        let components = [];
        const inputType = config.inputType || 'BUTTONS';

        if (inputType === 'SELECT') {
            const options = [];
            
            // Convert Map or Object to entries
            const typesSource = config.typesConfig instanceof Map 
                ? Array.from(config.typesConfig.entries()) 
                : Object.entries(config.typesConfig || {});

            if (typesSource.length > 0) {
                for (const [id, data] of typesSource) {
                    if (data.style === 'LINK') continue; // Select menu non supporta link esterni
                    
                    options.push({
                        label: data.label || (id.charAt(0).toUpperCase() + id.slice(1)),
                        value: `ticket_type_${id}`,
                        emoji: data.emoji || '🎫'
                    });
                }
            } else {
                 options.push({ label: 'Supporto Generale', value: 'ticket_type_supporto', emoji: '🎫' });
            }

            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_create_select')
                    .setPlaceholder('Seleziona una categoria...')
                    .addOptions(options.slice(0, 25))
            ));
        } else {
            // Default to buttons
            const row = new ActionRowBuilder();
             // Convert Map or Object to entries
             const typesSource = config.typesConfig instanceof Map 
             ? Array.from(config.typesConfig.entries()) 
             : Object.entries(config.typesConfig || {});

            if (typesSource.length > 0) {
                const entries = typesSource.slice(0, 5); // Discord limit
                for (const [id, data] of entries) {
                    const isLink = data.style === 'LINK' && data.url;
                    const btn = new ButtonBuilder()
                        .setLabel(data.label || (id.charAt(0).toUpperCase() + id.slice(1)))
                        .setStyle(isLink ? ButtonStyle.Link : getButtonStyle(data.style))
                        .setEmoji(data.emoji || '🎫');

                    if (isLink) {
                        btn.setURL(data.url);
                    } else {
                        btn.setCustomId(`ticket_type_${id}`);
                    }

                    row.addComponents(btn);
                }
            } else {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_type_supporto')
                        .setLabel('Apri Ticket')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎫')
                );
            }
            components.push(row);
        }

        // Cleanup old panels
        try {
            const messages = await channel.messages.fetch({ limit: 50 });
            const legacy = messages.filter(m => 
                m.author.id === client.user.id && 
                m.components.some(row => row.components.some(c => 
                    c.customId === 'open_ticket_select' || 
                    c?.customId?.startsWith('ticket_type_')
                ))
            );
            for (const m of legacy.values()) await m.delete().catch(() => {});
        } catch (err) { console.error('Cleanup error:', err); }

        const sentMessage = await channel.send({ embeds: [embed], components });
        
        config.panelMessageId = sentMessage.id;
        await config.save();

        invalidateCache(guildId);
        await logAudit(req, 'SEND_TICKETS_PANEL', { channelId: config.panelChannelId, messageId: sentMessage.id });
        res.json({ success: true, message: 'Pannello ticket inviato correttamente!' });
    } catch (error) {
        console.error('Error sending tickets panel:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio del pannello ticket.' });
    }
});

// GET ticket statistics
router.get('/:guildId/tickets/stats', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        
        const [total, open, closed, avgResponseData] = await Promise.all([
            Ticket.countDocuments({ guildId }),
            Ticket.countDocuments({ guildId, status: { $in: ['OPEN', 'PROCESSING', 'WAITING'] } }),
            Ticket.countDocuments({ guildId, status: 'CLOSED' }),
            Ticket.aggregate([
                { $match: { guildId, responseTimeMs: { $exists: true, $ne: null } } },
                { $group: { _id: null, avgResponse: { $avg: '$responseTimeMs' } } }
            ])
        ]);

        const avgResponseMs = avgResponseData.length > 0 ? avgResponseData[0].avgResponse : 0;
        
        res.json({
            success: true,
            data: {
                total,
                open,
                closed,
                avgResponseMs
            }
        });
    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        res.status(500).json({ success: false, error: 'Errore durante il recupero delle statistiche.' });
    }
});

// GET photo contest config
router.get('/:guildId/photocontest', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await PhotoContestConfig.findOne({ guildId });
        if (!config) config = await PhotoContestConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('photocontest', config, lang) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione photocontest' });
    }
});

// POST update photo contest config
router.post('/:guildId/photocontest', adminCheck, validate(photoContestSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData || req.body;

        const isPremium = (await Guild.findOne({ guildId }))?.isPremium;

        if (!isPremium && (data.themes || []).length > 5) {
            return res.status(403).json({ success: false, error: 'Free tier limit: 5 Contest Themes. Upgrade to PRO for more.' });
        }

        const config = await PhotoContestConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true }
        );
        
        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_PHOTO_CONTEST', req.validatedData);
        
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update photo contest config' });
    }
});

// GET verify config
router.get('/:guildId/verify', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await VerifyConfig.findOne({ guildId });
        if (!config) config = await VerifyConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('verify', config, lang) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione verifica' });
    }
});

// POST update verify config
router.post('/:guildId/verify', adminCheck, validate(verifySchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await VerifyConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
            { returnDocument: 'after', upsert: true }
        );
        
        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_VERIFY', req.validatedData);
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating verify config:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'aggiornamento della verifica' });
    }
});

// POST send verify panel
router.post('/:guildId/verify/send-panel', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await VerifyConfig.findOne({ guildId });
        
        if (!config || !config.channelId) {
            return res.status(400).json({ success: false, error: 'Configurazione non trovata o canale di verifica non impostato.' });
        }

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(config.channelId);

        if (!channel) {
            return res.status(404).json({ success: false, error: 'Canale di verifica non trovato su Discord.' });
        }

        const panelData = await messageService.getRaw(guildId, 'verify', 'panel');

        const embed = new EmbedBuilder()
            .setTitle(panelData.title || '✅ Verifica Account')
            .setDescription(panelData.description || 'Clicca il bottone qui sotto per verificarti.')
            .setColor(panelData.color?.startsWith('#') ? panelData.color : '#2ecc71')
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() });

        const btnData = config.buttons?.verify || { label: 'Verificati Ora', emoji: '✅', style: 'SUCCESS' };
        const isLink = btnData.style === 'LINK' && btnData.url;

        const verifyButton = new ButtonBuilder()
            .setLabel(btnData.label || 'Verificati Ora')
            .setEmoji(btnData.emoji || '✅')
            .setStyle(isLink ? ButtonStyle.Link : getButtonStyle(btnData.style));

        if (isLink) {
            verifyButton.setURL(btnData.url);
        } else {
            verifyButton.setCustomId('verify_user');
        }

        const row = new ActionRowBuilder().addComponents(verifyButton);

        // Cleanup old verify panels
        try {
            const messages = await channel.messages.fetch({ limit: 50 });
            const legacyPanels = messages.filter(m =>
                m.author.id === client.user.id &&
                m.components.some(row => row.components.some(c =>
                    c.customId === 'verify_user' ||
                    c.customId === 'setup-verify'
                ))
            );
            for (const m of legacyPanels.values()) {
                await m.delete().catch(() => {});
            }
        } catch (err) {
            console.error('[verify cleanup error]:', err.message);
        }

        const sentMessage = await channel.send({ embeds: [embed], components: [row] });

        // Update the config with current panel info
        config.panelMessageId = sentMessage.id;
        config.lastPanelMessageId = sentMessage.id;
        config.lastPanelChannelId = config.channelId;
        await config.save();

        invalidateCache(guildId);
        await logAudit(req, 'SEND_VERIFY_PANEL', { channelId: config.channelId, messageId: sentMessage.id });
        res.json({ success: true, message: 'Pannello di verifica inviato correttamente!' });
    } catch (error) {
        console.error('Error sending verify panel:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio del pannello di verifica.' });
    }
});

// POST update general guild settings
router.post('/:guildId/guild', adminCheck, validate(guildSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
            { returnDocument: 'after', upsert: true }
        );
        
        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_GUILD', req.validatedData);
        
        res.json(guild);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update guild settings' });
    }
});

// GET global config
router.get('/:guildId/global', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await GlobalConfig.findOne({ guildId });
        if (!config) config = await GlobalConfig.create({ guildId });
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error fetching global config:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione globale' });
    }
});

// POST update global config
router.post('/:guildId/global', adminCheck, validate(globalConfigSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData || req.body;

        const isPremium = (await Guild.findOne({ guildId }))?.isPremium;

        if (!isPremium && data.customBot) {
            // Check if any premium identity fields are being set
            const cb = data.customBot;
            if (cb.token || cb.name || cb.status || cb.removeBranding) {
                return res.status(403).json({ success: false, error: 'Custom Bot Identity is a PRO feature.' });
            }
        }

        const config = await GlobalConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true }
        );

        invalidateCache(guildId);
        invalidateGlobalCache(guildId);
        await logAudit(req, 'UPDATE_GLOBAL_CONFIG', req.validatedData);

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating global config:', error);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio della configurazione globale' });
    }
});

// GET welcome config
router.get('/:guildId/welcome', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await WelcomeConfig.findOne({ guildId });
        if (!config) config = await WelcomeConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('welcome', config, lang) });
    } catch (error) {
        console.error('Error fetching welcome config:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione welcome' });
    }
});

// POST update welcome config
router.post('/:guildId/welcome', adminCheck, validate(welcomeSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await WelcomeConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
            { returnDocument: 'after', upsert: true }
        );

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_WELCOME', req.validatedData);

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating welcome config:', error);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio della configurazione welcome' });
    }
});

// GET utility config
router.get('/:guildId/utility', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await UtilityConfig.findOne({ guildId });
        if (!config) config = await UtilityConfig.create({ guildId });
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error fetching utility config:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione utility' });
    }
});

// POST update utility config
router.post('/:guildId/utility', adminCheck, validate(utilitySchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await UtilityConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
            { returnDocument: 'after', upsert: true }
        );

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_UTILITY', req.validatedData);

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating utility config:', error);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio della configurazione utility' });
    }
});

// POST quick clear messages
router.post('/:guildId/utility/clear', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { channelId, amount } = req.body;

        if (!channelId || !amount) {
            return res.status(400).json({ success: false, error: 'Canale e quantità sono richiesti.' });
        }

        const clearAmount = parseInt(amount);
        if (isNaN(clearAmount) || clearAmount < 1 || clearAmount > 100) {
            return res.status(400).json({ success: false, error: 'Il numero di messaggi deve essere compreso tra 1 e 100.' });
        }

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);

        if (!channel || ![0, 5].includes(channel.type)) { // Text or Announcement
            return res.status(404).json({ success: false, error: 'Canale testuale non trovato.' });
        }

        const deleted = await channel.bulkDelete(clearAmount, true);

        await logAudit(req, 'DASHBOARD_CLEAR', { 
            channelId, 
            channelName: channel.name,
            amount: deleted.size 
        });

        res.json({ success: true, message: `Eliminati con successo ${deleted.size} messaggi.` });
    } catch (error) {
        console.error('Error in dashboard clear:', error);
        res.status(500).json({ success: false, error: 'Impossibile eliminare i messaggi. Potrebbero essere più vecchi di 14 giorni.' });
    }
});

// GET socials config
router.get('/:guildId/socials', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await SocialConfig.findOne({ guildId });
        
        if (!config) {
            config = await SocialConfig.create({ guildId });
        }

        // Ensure all platforms have a webhook token if missing (for existing docs)
        let modified = false;
        const platforms = ['twitch', 'youtube', 'instagram', 'tiktok', 'twitter'];
        for (const p of platforms) {
            if (!config.platforms[p]) {
                config.platforms[p] = {};
                modified = true;
            }
            if (!config.platforms[p].webhookToken) {
                config.platforms[p].webhookToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                modified = true;
            }
        }

        if (modified) {
            await config.save();
        }
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error fetching socials configuration:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione socials' });
    }
});

// POST update socials config
router.post('/:guildId/socials', adminCheck, validate(socialSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData || req.body;

        if (data._id) delete data._id;
        if (data.__v !== undefined) delete data.__v;

        const existing = await SocialConfig.findOne({ guildId });
        if (existing) {
            // MERGE LOGIC: Preserve internal state (isLive, lastPostId) for existing accounts
            for (const platform of ['twitch', 'youtube', 'instagram', 'tiktok', 'twitter']) {
                if (data.platforms?.[platform]?.accounts) {
                    const newAccounts = data.platforms[platform].accounts;
                    const oldAccounts = existing.platforms[platform]?.accounts || [];
                    
                    data.platforms[platform].accounts = newAccounts.map(newAcc => {
                        const oldAcc = oldAccounts.find(oa => oa.username === newAcc.username);
                        if (oldAcc) {
                            return {
                                ...newAcc,
                                isLive: oldAcc.isLive,
                                lastPostId: oldAcc.lastPostId,
                                lastCheckAt: oldAcc.lastCheckAt,
                                discordUserId: newAcc.discordUserId === undefined ? oldAcc.discordUserId : newAcc.discordUserId
                            };
                        }
                        return newAcc;
                    });
                }

                // SANITIZE LOGIC: Automatically remove old "Connettiti alla frequenza" text if found
                if (data.platforms?.[platform]?.embed?.description) {
                    data.platforms[platform].embed.description = data.platforms[platform].embed.description
                        .replace(/\[Connettiti alla frequenza\]\(.*\)/g, '')
                        .replace(/\[Entra in Live\]\(.*\)/g, '') // Also clean this up as we have the button now
                        .replace(/\[Guarda ora\]\(.*\)/g, '')
                        .trim();
                }
            }
        }

        const config = await SocialConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_SOCIALS', data);
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating socials configuration:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST reset module config
const resetModuleSchema = z.enum(['whitelist', 'tickets', 'photocontest', 'voice', 'verify', 'global', 'welcome', 'utility']);

router.post('/:guildId/reset/:module', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        
        const moduleValidation = resetModuleSchema.safeParse(module);
        if (!moduleValidation.success) {
            return res.status(400).json({ error: 'Invalid module name for reset' });
        }
        
        if (module === 'whitelist') {
            await WhitelistConfig.findOneAndDelete({ guildId });
        } else if (module === 'tickets') {
            await TicketConfig.findOneAndDelete({ guildId });
        } else if (module === 'photocontest') {
            await PhotoContestConfig.findOneAndDelete({ guildId });
        } else if (module === 'verify') {
            await VerifyConfig.findOneAndDelete({ guildId });
        } else if (module === 'global') {
            await GlobalConfig.findOneAndDelete({ guildId });
            invalidateGlobalCache(guildId);
        } else if (module === 'welcome') {
            await WelcomeConfig.findOneAndDelete({ guildId });
        } else if (module === 'utility') {
            await UtilityConfig.findOneAndDelete({ guildId });
        } else if (module === 'voice') {
            const config = await WhitelistConfig.findOne({ guildId });
            if (config) {
                config.voiceSettings = {
                    joinChannelId: '',
                    categoryId: '',
                    autoDelete: true,
                    maxConcurrent: 5,
                    paused: false,
                    pingStaffOnJoin: false,
                    interviewChecklist: ['Identità e Storia', 'Conoscenza Regolamento', 'Motivazioni']
                };
                await config.save();
            }
        }

        invalidateCache(guildId);
        await logAudit(req, 'RESET_MODULE', { module });
        
        res.json({ success: true, message: `Modulo ${module} resettato correttamente` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset configuration' });
    }
});

// GET guild configuration (Premium info and White-label)
router.get('/:guildId/guild', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOne({ guildId });
        
        if (!guild) {
            // Create a default entry if it doesn't exist
            const newGuild = new Guild({ guildId });
            await newGuild.save();
            return res.json({ success: true, data: newGuild });
        }

        res.json({ success: true, data: guild });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nel caricamento dei dati del server' });
    }
});

// PATCH guild configuration (White-label settings)
router.patch('/:guildId/guild', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const guild = await Guild.findOne({ guildId });

        if (!guild || !guild.isPremium) {
            return res.status(403).json({ success: false, error: 'Queste funzioni richiedono un abbonamento Premium attivo.' });
        }

        const { customBotName, customStatuses, statusRotationInterval, hideBranding } = req.body;

        const oldSettings = {
            customBotName: guild.customBotName,
            customStatuses: guild.customStatuses,
            statusRotationInterval: guild.statusRotationInterval,
            hideBranding: guild.hideBranding
        };

        guild.customBotName = customBotName !== undefined ? (customBotName === '' ? null : customBotName) : guild.customBotName;
        guild.customStatuses = customStatuses !== undefined ? customStatuses : guild.customStatuses;
        guild.statusRotationInterval = statusRotationInterval !== undefined ? statusRotationInterval : guild.statusRotationInterval;
        guild.hideBranding = hideBranding !== undefined ? hideBranding : guild.hideBranding;

        await guild.save();

        // Trigger immediate synchronization
        try {
            let discordGuild = req.discordClient.guilds.cache.get(guildId);
            
            // Fallback to main bot if private bot doesn't see the guild
            if (!discordGuild && req.discordClient !== req.mainClient) {
                discordGuild = req.mainClient.guilds.cache.get(guildId);
            }

            if (discordGuild) {
                await whiteLabelHelper.syncGuildIdentity(discordGuild);
            }
            
            // Sync global status for the current client (and main client if different)
            await whiteLabelHelper.syncGlobalStatus(req.discordClient, true);
            if (req.discordClient !== req.mainClient) {
                await whiteLabelHelper.syncGlobalStatus(req.mainClient, true);
            }
        } catch (syncError) {
            console.error('[WhiteLabel] Failed immediate sync:', syncError);
        }

        await logAudit(req, 'UPDATE_WHITE_LABEL', {
            old: oldSettings,
            new: { customBotName, customStatuses, statusRotationInterval, hideBranding }
        });

        res.json({ success: true, message: 'Impostazioni aggiornate con successo' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile aggiornare le impostazioni' });
    }
});

// GET audit logs
router.get('/:guildId/audit-logs', adminCheck, async (req, res) => {
    try {
        const guild = await Guild.findOne({ guildId: req.params.guildId });
        if (!guild || !guild.isPremium) {
            return res.status(403).json({ success: false, error: 'Audit Logs richiedono un abbonamento Premium attivo.' });
        }

        const logs = await DashboardAuditLog.find({ guildId: req.params.guildId })
            .select('userId username action timestamp changes')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare gli audit logs' });
    }
});

// DELETE clear audit logs
router.delete('/:guildId/audit-logs', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        
        // Delete all logs for this guild
        await DashboardAuditLog.deleteMany({ guildId });
        
        // Log the deletion action itself
        await logAudit(req, 'RESET_AUDIT_LOGS', { 
            message: 'All audit logs have been cleared by an administrator' 
        });

        res.json({ success: true, message: 'Log resettati con successo' });
    } catch (error) {
        console.error('Error clearing audit logs:', error);
        res.status(500).json({ success: false, error: 'Errore durante la cancellazione dei log' });
    }
});

// GET stats
router.get('/:guildId/stats', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const [openTickets, pendingWL, activeVoice] = await Promise.all([
            Ticket.countDocuments({ guildId, status: { $ne: 'CLOSED' } }),
            WhitelistApp.countDocuments({ guildId, status: 'SUBMITTED' }),
            VoiceQueue.countDocuments({ guildId, status: { $in: ['WAITING', 'ACTIVE'] } })
        ]);

        res.json({
            success: true,
            data: {
                openTickets,
                pendingWhitelist: pendingWL,
                activeVoiceSessions: activeVoice
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nel recupero delle statistiche: riprova tra qualche secondo.' });
    }
});

// GET Discord metadata (Roles and Channels) for selectors
router.get('/:guildId/discord-data', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let client = req.discordClient;
        // 1. Check if bot is ready
        if (!client.isReady()) {
            return res.status(503).json({ 
                success: false, 
                error: 'Il bot si sta ancora avviando. Riprova tra qualche secondo.' 
            });
        }

        // 2. Robust Presence Check with Fallback
        let guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            guild = await client.guilds.fetch(guildId).catch(() => null);
        }

        // FALLBACK: If current client (Private Bot) doesn't have it, try Main Bot
        if (!guild && client !== req.mainClient) {
            console.log(`[Dashboard_API] Private bot ${client.user?.tag} not in guild ${guildId}. Falling back to Main Bot for discord-data.`);
            client = req.mainClient;
            guild = client.guilds.cache.get(guildId);
            if (!guild) {
                guild = await client.guilds.fetch(guildId).catch(() => null);
            }
            if (guild) {
                console.log(`[Dashboard_API] Successfully switched to Main Bot for guild ${guildId}`);
            } else {
                console.error(`[Dashboard_API] Main Bot also failed to find guild ${guildId}`);
            }
        }

        if (!guild) {
            console.error(`[Dashboard_API] No bot (Main or Private) found in guild ${guildId}`);
            return res.status(404).json({ 
                success: false, 
                error: 'Il bot non è presente in questo server. Assicurati di averlo invitato correttamente.',
                debug: {
                    mainBotId: req.mainClient.user?.id,
                    guildId
                }
            });
        }

        // 4. Forced Data Fetching (Parallel)
        const [rolesFetched, channelsFetched, membersFetched, temp, wl, supp] = await Promise.all([
            guild.roles.fetch().catch(err => {
                console.error(`[ERROR] Failed to fetch roles for ${guildId}:`, err);
                return guild.roles.cache;
            }),
            guild.channels.fetch().catch(err => {
                console.error(`[ERROR] Failed to fetch channels for ${guildId}:`, err);
                return guild.channels.cache;
            }),
            guild.members.fetch({ limit: 1000 }).catch(err => {
                console.error(`[ERROR] Failed to fetch members for ${guildId}:`, err);
                return [];
            }),
            TempVoiceConfig.findOne({ guildId }),
            WhitelistConfig.findOne({ guildId }),
            SupportConfig.findOne({ guildId })
        ]);

        console.log(`[Dashboard_API] Data Fetch for ${guildId}: ${rolesFetched.size} roles, ${channelsFetched.size} channels.`);

        const occupiedChannels = {};
        if (temp?.creatorChannelId) occupiedChannels[temp.creatorChannelId] = 'Temp Voice';
        if (wl?.voiceSettings?.joinChannelId) occupiedChannels[wl.voiceSettings.joinChannelId] = 'Whitelist';
        if (supp?.voiceSettings?.joinChannelId) occupiedChannels[supp.voiceSettings.joinChannelId] = 'Assistenza';

        const botMember = await guild.members.fetchMe().catch(() => null);
        const botHighestPosition = botMember ? botMember.roles.highest.position : 0;

        // 5. Standardized Permissions Check
        const manageRoles = botMember ? botMember.permissions.has(PermissionFlagsBits.ManageRoles) : false;
        const viewChannels = botMember ? botMember.permissions.has(PermissionFlagsBits.ViewChannel) : false;

        // 6. Map to exact output format
        const roles = rolesFetched
            .filter(r => r.name !== '@everyone' && !r.managed)
            .map(r => ({ 
                id: r.id, 
                name: r.name, 
                color: r.hexColor,
                position: r.position,
                assignable: r.position < botHighestPosition && manageRoles
            }))
            .sort((a, b) => b.position - a.position);

        const channels = channelsFetched
            .filter(c => [0, 2, 4, 5].includes(c.type)) // Text, Voice, Category or Announcement
            .map(c => ({ 
                id: c.id, 
                name: c.name, 
                type: c.type,
                occupiedBy: occupiedChannels[c.id] || null
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
            
        const members = Array.from(membersFetched.values())
            .filter(m => !m.user.bot)
            .map(m => ({
                id: m.id,
                name: m.user.tag === '0' ? m.user.username : m.user.tag,
                displayName: m.displayName
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        // 7. Enhanced Empty State Check & Debug
        if (roles.length === 0 && channels.length === 0) {
            let errorMsg = 'Nessun ruolo o canale trovato.';
            if (!viewChannels) errorMsg += ' Attenzione: Il bot non ha il permesso "Visualizza Canali".';
            if (!manageRoles) errorMsg += ' Attenzione: Il bot non ha il permesso "Gestisci Ruoli".';
            
            return res.status(200).json({ success: true, warning: errorMsg, data: { roles: [], channels: [], members } });
        }

        res.json({ 
            success: true, 
            data: { 
                roles, 
                channels,
                members,
                botHighestPosition,
                permissions: {
                    manageRoles,
                    viewChannels
                }
            } 
        });
    } catch (error) {
        console.error('[CRITICAL] Error fetching discord data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Errore interno nel recupero dei dati Discord. Verifica i log del bot.' 
        });
    }
});

// GET fivem config
router.get('/:guildId/fivem', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await FiveMConfig.findOne({ guildId });
        if (!config) {
            config = await FiveMConfig.create({ guildId });
        }
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('fivem', config, lang) });
    } catch (error) {
        console.error('Error fetching fivem configuration:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione FiveM' });
    }
});

// POST fivem config
router.post('/:guildId/fivem', adminCheck, validate(fivemSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const updateData = req.body;

        const config = await FiveMConfig.findOneAndUpdate(
            { guildId },
            updateData,
            { returnDocument: 'after', upsert: true }
        );

        await logAudit(req, 'UPDATE_FIVEM', updateData);
        invalidateCache(guildId, 'fivem');

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating fivem configuration:', error);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio della configurazione FiveM' });
    }
});

// POST fivem ping server logic
router.post('/:guildId/fivem/ping', adminCheck, async (req, res) => {
    try {
        const { serverIp } = req.body;
        if (!serverIp) return res.status(400).json({ success: false, error: "Nessun IP fornito." });

        const baseUrl = serverIp.startsWith('http') ? serverIp : `http://${serverIp}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        
        const [infoRes, playersRes] = await Promise.all([
            fetch(`${baseUrl}/info.json`, { signal: controller.signal }).catch(() => null),
            fetch(`${baseUrl}/players.json`, { signal: controller.signal }).catch(() => null)
        ]);
        clearTimeout(timeout);

        if (!infoRes || !infoRes.ok || !playersRes || !playersRes.ok) {
            return res.status(404).json({ success: false, error: "Server non raggiungibile (Timeout) o endpoint invalido." });
        }
        
        const info = await infoRes.json();
        const players = await playersRes.json();
        let sName = info.vars?.sv_hostname || info.server || serverIp;
        sName = sName.replace(/\^[0-9]/g, '');

        res.json({ success: true, data: { name: sName, maxPlayers: info.vars?.sv_maxClients || 0, players: Array.isArray(players) ? players.length : 0 }});
    } catch (error) {
         res.status(500).json({ success: false, error: 'Errore generico durante il pinging.' });
    }
});

// POST fivem send panel
router.post('/:guildId/fivem/send-panel', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { serverId } = req.body; // Can specify which server to send, or all
        
        const config = await FiveMConfig.findOne({ guildId });
        if (!config || !config.servers || config.servers.length === 0) {
            return res.status(400).json({ success: false, error: 'Configurazione FiveM non trovata o nessun server configurato.' });
        }

        const server = config.servers.find(s => s.id === serverId);
        if (!server) {
            return res.status(404).json({ success: false, error: 'Server specifico non trovato nella configurazione.' });
        }

        if (!server.statusChannelId) {
            return res.status(400).json({ success: false, error: 'Canale di stato non configurato per questo server.' });
        }

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(server.statusChannelId);

        if (!channel) {
            return res.status(404).json({ success: false, error: 'Canale Discord non trovato o inaccessibile.' });
        }

        const embed = new EmbedBuilder()
            .setTitle(server.onlineEmbed.title || 'Inizializzazione Monitoraggio...')
            .setDescription(server.onlineEmbed.description || 'Il bot sta caricando i dati del server...')
            .setColor(server.onlineEmbed.color || '#5865F2')
            .setTimestamp();

        const msg = await channel.send({ embeds: [embed] });

        // Update the server's messageId in the database
        server.messageId = msg.id;
        await config.save();

        res.json({ success: true, message: 'LiveBoard inviata con successo! Il bot inizierà a aggiornarla tra pochi istanti.' });
    } catch (error) {
        console.error('Error sending fivem panel:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio della LiveBoard.' });
    }
});

// POST photocontest force start
router.post('/:guildId/photocontest/force-start', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await PhotoContestConfig.findOne({ guildId });
        
        if (!config || !config.enabled) {
            return res.status(400).json({ success: false, error: 'Modulo Photo Contest disabilitato o non configurato.' });
        }

        // We can't call manager directly, but we can set nextContestAt to now and wait for the interval
        // OR we can use the bot instance if we have it.
        // Since we have req.discordClient, we can actually trigger the manager if it's attached to the client.
        if (req.discordClient.photocontestManager) {
            await req.discordClient.photocontestManager.startContest(config);
            res.json({ success: true, message: 'Contest avviato manualmente!' });
        } else {
            // Fallback: set timer to now
            config.nextContestAt = new Date();
            await config.save();
            res.json({ success: true, message: 'Contest pianificato per l\'avvio immediato (entro 1 minuto).' });
        }
        
        await logAudit(req, 'FORCE_START_PHOTOCONTEST', { guildId });
    } catch (error) {
        console.error('Error force starting photocontest:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'avvio del contest.' });
    }
});

// POST photocontest force end
router.post('/:guildId/photocontest/force-end', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const activeContest = await PhotoContest.findOne({ guildId, status: 'ACTIVE' });
        
        if (!activeContest) {
            return res.status(400).json({ success: false, error: 'Nessun contest attivo da terminare.' });
        }

        if (req.discordClient.photocontestManager) {
            await req.discordClient.photocontestManager.endContest(activeContest);
            res.json({ success: true, message: 'Contest terminato manualmente!' });
        } else {
            // Fallback: set endTime to now
            activeContest.endTime = new Date();
            await activeContest.save();
            res.json({ success: true, message: 'Contest pianificato per il termine immediato (entro 1 minuto).' });
        }
        
        await logAudit(req, 'FORCE_END_PHOTOCONTEST', { guildId });
    } catch (error) {
        console.error('Error force ending photocontest:', error);
        res.status(500).json({ success: false, error: 'Errore durante il termine del contest.' });
    }
});

// POST welcome test
router.post('/:guildId/welcome/test', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await WelcomeConfig.findOne({ guildId });
        
        if (!config || !config.enabled || !config.welcome?.enabled || !config.welcome?.channelId) {
            return res.status(400).json({ success: false, error: 'Modulo Welcome disabilitato o canale non impostato.' });
        }

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetchMe();

        const channel = await guild.channels.fetch(config.welcome.channelId);
        if (!channel) return res.status(404).json({ success: false, error: 'Canale non trovato.' });

        const placeholders = {
            user: member.user.username,
            user_mention: member.toString(),
            user_tag: member.user.tag,
            user_avatar: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
            guild: guild.name,
            member_count: guild.memberCount.toString()
        };

        const wEmbed = config.welcome.embed || {};
        const isPlaceholder = (val) => !val || (typeof val === 'string' && (val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.'));

        const rawTitle = isPlaceholder(wEmbed.title) ? '✈️ Benvenuto in Città' : wEmbed.title;
        const rawDesc = isPlaceholder(wEmbed.description) ? 'Un nuovo cittadino, **{user}**, è appena atterrato! Ti auguriamo una permanenza prospera.' : wEmbed.description;

        const embed = new EmbedBuilder()
            .setTitle(placeholderHelper.replace(rawTitle, placeholders))
            .setDescription(placeholderHelper.replace(rawDesc, placeholders))
            .setColor(wEmbed.color && wEmbed.color !== '#000000' ? wEmbed.color : '#2ecc71')
            .setThumbnail(placeholders.user_avatar)
            .setTimestamp();

        if (wEmbed.footer) embed.setFooter({ text: placeholderHelper.replace(wEmbed.footer, placeholders), iconURL: guild.iconURL() });
        if (wEmbed.thumbnail && !isPlaceholder(wEmbed.thumbnail)) {
            embed.setThumbnail(placeholderHelper.replace(wEmbed.thumbnail, placeholders));
        }
        if (wEmbed.image) embed.setImage(placeholderHelper.replace(wEmbed.image, placeholders));

        await channel.send({ embeds: [embed] });

        res.json({ success: true, data: { message: 'Messaggio di prova inviato!' } });
        await logAudit(req, 'TEST_WELCOME', { channelId: config.welcome.channelId });
    } catch (error) {
        console.error('Error testing welcome:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio del test.' });
    }
});

// POST Onboarding (Bulk save)
router.post('/:guildId/onboarding', adminCheck, validate(onboardingSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.body;

        // 1. Update Global Config
        await GlobalConfig.findOneAndUpdate(
            { guildId },
            { 
                language: data.language,
                adminRoleIds: data.adminRoleIds,
                'logs.channelId': data.logChannelId,
                'logs.enabled': !!data.logChannelId
            },
            { upsert: true }
        );
        invalidateGlobalCache(guildId);

        // 2. Update Whitelist Module
        if (data.modules.whitelist) {
            const wlUpdate = { enabled: true };
            if (data.config.whitelist?.categoryOpenId) wlUpdate.categoryOpenId = data.config.whitelist.categoryOpenId;
            if (data.config.whitelist?.whitelistRole) {
                wlUpdate.rolesToAddOnTextPass = [data.config.whitelist.whitelistRole];
                wlUpdate.voiceSettings = { rolesToAdd: [data.config.whitelist.whitelistRole] };
            }
            await WhitelistConfig.findOneAndUpdate({ guildId }, wlUpdate, { upsert: true });
        } else {
            await WhitelistConfig.findOneAndUpdate({ guildId }, { enabled: false }, { upsert: true });
        }

        // 3. Update Ticket Module
        if (data.modules.tickets) {
            const tkUpdate = { enabled: true };
            if (data.config.tickets?.categoryOpenId) tkUpdate.categoryOpenId = data.config.tickets.categoryOpenId;
            if (data.config.tickets?.staffRoleIds) tkUpdate.staffRoleIds = data.config.tickets.staffRoleIds;
            await TicketConfig.findOneAndUpdate({ guildId }, tkUpdate, { upsert: true });
        } else {
            await TicketConfig.findOneAndUpdate({ guildId }, { enabled: false }, { upsert: true });
        }

        // 4. Update Verify Module
        if (data.modules.verify) {
            const vrUpdate = { enabled: true };
            if (data.config.verify?.channelId) vrUpdate.channelId = data.config.verify.channelId;
            if (data.config.verify?.roleId) vrUpdate.roleId = data.config.verify.roleId;
            await VerifyConfig.findOneAndUpdate({ guildId }, vrUpdate, { upsert: true });
        } else {
            await VerifyConfig.findOneAndUpdate({ guildId }, { enabled: false }, { upsert: true });
        }

        // Invalidate all caches
        invalidateCache(guildId, 'whitelist');
        invalidateCache(guildId, 'tickets');
        invalidateCache(guildId, 'verify');

        await logAudit(req, 'ONBOARDING_COMPLETED', { guildId });
        res.json({ success: true, message: 'Onboarding completato con successo!' });
    } catch (error) {
        console.error('Error during onboarding save:', error);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio dell\'onboarding.' });
    }
});


// GET moderation config
router.get('/:guildId/moderation', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await ModerationConfig.findOne({ guildId });
        if (!config) config = await ModerationConfig.create({ guildId });
        
        const lang = await messageService.getGuildLanguage(guildId);
        res.json({ success: true, data: mergeModuleDefaults('moderation', config, lang) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione moderazione' });
    }
});

// POST update moderation config
router.post('/:guildId/moderation', adminCheck, validate(moderationSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await ModerationConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
            { returnDocument: 'after', upsert: true }
        );
        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_MODERATION', req.validatedData);
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating moderation config:', error);
        res.status(500).json({ success: false, error: 'Errore durante il salvataggio della configurazione moderazione' });
    }
});

// GET support config
router.get('/:guildId/support', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await SupportConfig.findOne({ guildId });
        if (!config) config = await SupportConfig.create({ guildId });
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione assistenza' });
    }
});

// POST update support config
router.post('/:guildId/support', adminCheck, validate(supportSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData;

        // Conflict check: if Support Voice joinChannelId is set, clear it in TempVoice and Whitelist
        const joinChannelId = data.voiceSettings?.joinChannelId;
        if (joinChannelId) {
             // Clear TempVoice
             const tempConfig = await TempVoiceConfig.findOne({ guildId });
             if (tempConfig && tempConfig.creatorChannelId === joinChannelId) {
                 tempConfig.creatorChannelId = null;
                 await tempConfig.save();
                 invalidateCache(guildId, 'tempvoice');
             }
             // Clear Whitelist
             const wlConfig = await WhitelistConfig.findOne({ guildId });
             if (wlConfig && wlConfig.voiceSettings?.joinChannelId === joinChannelId) {
                 wlConfig.voiceSettings.joinChannelId = null;
                 await wlConfig.save();
                 invalidateCache(guildId, 'whitelist');
             }
        }

        const config = await SupportConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true }
        );
        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_SUPPORT', data);
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating support config:', error);
        res.status(500).json({ success: false, error: 'Failed to update support config' });
    }
});

// POST sync config from another guild (Platinum only)
router.post('/:guildId/sync', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { sourceGuildId, modules } = req.body;

        if (!sourceGuildId) {
            return res.status(400).json({ success: false, error: 'Server sorgente non specificato.' });
        }

        // 1. Check if target is Platinum
        const targetGuild = await Guild.findOne({ guildId });
        if (targetGuild?.premiumTier !== 'platinum') {
            return res.status(403).json({ success: false, error: 'La Sincronizzazione Globale è un\'esclusiva Platinum.' });
        }

        // 2. Check if user has access to source guild (using session data)
        const userGuilds = req.user.guilds || [];
        const sourceInUserGuilds = userGuilds.find(g => g.id === sourceGuildId && (g.permissions & 0x8));
        if (!sourceInUserGuilds) {
            return res.status(403).json({ success: false, error: 'Non hai i permessi di Amministratore nel server sorgente.' });
        }

        // 3. Define modules to sync
        const moduleModels = {
            whitelist: WhitelistConfig,
            tickets: TicketConfig,
            automations: AutomationConfig,
            moderation: ModerationConfig,
            fivem: FiveMConfig,
            welcome: WelcomeConfig,
            verify: VerifyConfig,
            socials: SocialConfig,
            utility: UtilityConfig,
            reactionroles: ReactionRoleConfig,
            polls: PollConfig
        };

        const syncedModules = [];
        const modulesToSync = modules || Object.keys(moduleModels);

        for (const mod of modulesToSync) {
            const Model = moduleModels[mod];
            if (!Model) continue;

            const sourceData = await Model.findOne({ guildId: sourceGuildId });
            if (sourceData) {
                const cleanData = sourceData.toObject();
                delete cleanData._id;
                delete cleanData.guildId;
                delete cleanData.createdAt;
                delete cleanData.updatedAt;
                delete cleanData.__v;

                await Model.findOneAndUpdate(
                    { guildId: guildId },
                    { $set: cleanData },
                    { upsert: true }
                );
                syncedModules.push(mod);
            }
        }

        invalidateCache(guildId);
        await logAudit(req, guildId, 'SYNC_CONFIG', { sourceGuildId, modules: syncedModules });

        res.json({ 
            success: true, 
            message: `Sincronizzati ${syncedModules.length} moduli con successo.`,
            syncedModules 
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ success: false, error: 'Errore durante la sincronizzazione.' });
    }
});

// --- REACTION ROLES ---
router.post('/:guildId/reaction-roles', adminCheck, validate(reactionRoleSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await ReactionRoleConfig.findOneAndUpdate(
            { guildId },
            { $set: req.body },
            { upsert: true, returnDocument: 'after' }
        );
        invalidateCache(guildId);
        await logAudit(req, guildId, 'UPDATE_REACTION_ROLES', req.body);
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/:guildId/reaction-roles/deploy/:panelId', adminCheck, async (req, res) => {
    try {
        const { guildId, panelId } = req.params;
        const result = await req.discordClient.reactionRoleManager.deployPanel(guildId, panelId);
        if (result.success) {
            res.json({ success: true, messageId: result.messageId });
        } else {
            res.status(400).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- POLLS ---
router.post('/:guildId/polls/config', adminCheck, validate(pollConfigSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await PollConfig.findOneAndUpdate(
            { guildId },
            { $set: req.body },
            { upsert: true, returnDocument: 'after' }
        );
        invalidateCache(guildId);
        await logAudit(req, guildId, 'UPDATE_POLL_CONFIG', req.body);
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/:guildId/polls/active', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const polls = await Poll.find({ guildId, ended: false }).sort({ createdAt: -1 });
        res.json(polls);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/:guildId/polls/create', adminCheck, validate(pollCreateSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const { channelId, question, options, duration, mode, color } = req.body;

        const guild = req.discordClient.guilds.cache.get(guildId);
        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (!channel) return res.status(400).json({ success: false, error: 'Canale non trovato.' });

        const endTime = new Date(Date.now() + duration * 60000);

        const embed = new EmbedBuilder()
            .setTitle(`📊 Sondaggio: ${question}`)
            .setDescription(options.map(o => `${o.emoji} **${o.label}**`).join('\n\n'))
            .setColor(color)
            .setFooter({ text: `Termina il` })
            .setTimestamp(endTime);

        const rows = [];
        let currentRow = new ActionRowBuilder();
        options.forEach((opt, idx) => {
            if (idx > 0 && idx % 5 === 0) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder();
            }
            currentRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`poll_vote_${idx}`) // Index used for lookup in manager
                    .setEmoji(opt.emoji)
                    .setStyle(ButtonStyle.Secondary)
            );
        });
        if (currentRow.components.length > 0) rows.push(currentRow);

        const message = await channel.send({ embeds: [embed], components: rows });

        const poll = new Poll({
            guildId,
            channelId,
            messageId: message.id,
            question,
            options: options.map(o => ({ emoji: o.emoji, label: o.label, votes: [] })),
            endTime,
            mode,
            creatorId: req.user.discordId,
            color
        });

        await poll.save();
        await logAudit(req, guildId, 'CREATE_POLL', { question, channelId });

        res.json({ success: true, pollId: poll._id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- ONBOARDING ROUTES ---

router.post('/:guildId/onboarding/complete', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const { modules, autoChannels, adminRoles, staffRole, customChannelNames } = req.body;

        const client = req.discordClient;
        const guild = await client.guilds.fetch(guildId).catch(() => null);

        if (!guild) {
            return res.status(404).json({ success: false, error: 'Server non trovato o bot non presente.' });
        }

        let createdChannels = {};
        if (autoChannels) {
            createdChannels = await createDefaultChannels(guild, modules, customChannelNames);
        }

        // 1. Mark setup as completed and enable modules
        await Guild.findOneAndUpdate(
            { guildId },
            { 
                $set: { 
                    setupCompleted: true,
                    enabledModules: modules
                } 
            },
            { upsert: true }
        );

        // 2. Initialize specific module configs with channels and roles
        await initializeModuleConfigs(guildId, createdChannels, { 
            adminRoles, 
            staffRole, 
            language, 
            prefix, 
            nickname, 
            ticketCategory, 
            welcomeStyle 
        }, guild);

        await logAudit(req, guildId, 'ONBOARDING_COMPLETED', 'Onboarding Setup Finished', { modules, autoChannels });
        
        res.json({ success: true, message: 'Setup completato con successo!' });
    } catch (error) {
        console.error('[Onboarding] Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante la finalizzazione del setup.' });
    }
});

/**
 * LEAVE SERVER
 * Endpoint to make the bot leave a guild.
 * Restricted to Server Owner or Hardcoded Admins.
 */
router.post('/:guildId/leave', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        // Use the client attached by multi-bot middleware or default client
        const client = req.discordClient;
        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return res.status(404).json({ success: false, message: 'Server non trovato nella cache del bot.' });
        }

        // Security check: Only owner or hardcoded super-admins
        const isOwner = guild.ownerId === req.user.id;
        const isHardcodedAdmin = ['361159834688552960', '314417452395626496'].includes(req.user.id);

        if (!isOwner && !isHardcodedAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Azione protetta: Solo il proprietario del server o gli sviluppatori Verix possono eseguire questa operazione.' 
            });
        }

        await logAudit(req, guildId, 'GUILD_LEAVE', 'Il bot ha lasciato il server tramite dashboard');
        
        // Final action
        await guild.leave();

        res.json({ success: true, message: 'Il bot ha lasciato il server con successo.' });
    } catch (err) {
        console.error('[API_ERROR] Failed to leave guild:', err);
        res.status(500).json({ success: false, message: 'Errore interno durante l\'esecuzione dell\'uscita.' });
    }
});

export default router;
