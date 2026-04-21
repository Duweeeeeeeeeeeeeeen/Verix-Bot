import express from 'express';
import { z } from 'zod';
import WhitelistConfig from '../../../src/models/WhitelistConfig.js';
import TicketConfig from '../../../src/models/TicketConfig.js';
import Guild from '../../../src/models/Guild.js';
import Ticket from '../../../src/models/Ticket.js';
import WhitelistApp from '../../../src/models/WhitelistApp.js';
import VoiceQueue from '../../../src/models/VoiceQueue.js';
import PhotoContestConfig from '../../../src/models/PhotoContestConfig.js';
import VerifyConfig from '../../../src/models/VerifyConfig.js';
import GlobalConfig from '../../../src/models/GlobalConfig.js';
import FiveMConfig from '../../../src/models/FiveMConfig.js';
import DashboardAuditLog from '../../../src/models/DashboardAuditLog.js';
import WelcomeConfig from '../../../src/models/WelcomeConfig.js';
import UtilityConfig from '../../../src/models/UtilityConfig.js';
import BackgroundConfig from '../../../src/models/BackgroundConfig.js';
import TwitchConfig from '../../../src/models/TwitchConfig.js';
import { mergeModuleDefaults } from '../utils/mergeDefaults.js';


import { adminCheck } from '../middleware/adminCheck.js';
import { checkBotPermissions } from '../../../src/utils/permissionHelper.js';
import { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { invalidateCache } from '../../../src/core/configCache.js';
import { invalidateGlobalCache } from '../../../src/core/globalConfigManager.js';
import { buildButtonRows } from '../../../src/utils/uiBuilder.js';

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
import { twitchSchema } from '../validations/twitchSchema.js';



const router = express.Router();

// GET all configs for a guild
router.get('/:guildId', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        
        // Fetch all configurations in parallel to reduce latency
        const [whitelist, tickets, contest, verify, guild, globalCfg, welcome, utility, fivem, twitch] = await Promise.all([
            WhitelistConfig.findOne({ guildId }),
            TicketConfig.findOne({ guildId }),
            PhotoContestConfig.findOne({ guildId }),
            VerifyConfig.findOne({ guildId }),
            Guild.findOne({ guildId }),
            GlobalConfig.findOne({ guildId }),
            WelcomeConfig.findOne({ guildId }),
            UtilityConfig.findOne({ guildId }),
            FiveMConfig.findOne({ guildId }),
            TwitchConfig.findOne({ guildId })
        ]);

        let wlConfig = whitelist;
        let tkConfig = tickets;
        let photoConfig = contest;
        let verifyConfig = verify;
        let guildData = guild;
        let globalConfig = globalCfg;
        let wlcmConfig = welcome;
        let utilConfig = utility;
        let fmConfig = fivem;
        let twConfig = twitch;

        // Create missing configurations in parallel if they don't exist
        const creations = [];
        if (!wlConfig) creations.push(WhitelistConfig.create({ guildId }).then(res => wlConfig = res));
        if (!tkConfig) creations.push(TicketConfig.create({ guildId }).then(res => tkConfig = res));
        if (!photoConfig) creations.push(PhotoContestConfig.create({ guildId }).then(res => photoConfig = res));
        if (!verifyConfig) creations.push(VerifyConfig.create({ guildId }).then(res => verifyConfig = res));
        if (!guildData) creations.push(Guild.create({ guildId }).then(res => guildData = res));
        if (!globalConfig) creations.push(GlobalConfig.create({ guildId }).then(res => globalConfig = res));
        if (!wlcmConfig) creations.push(WelcomeConfig.create({ guildId }).then(res => wlcmConfig = res));
        if (!utilConfig) creations.push(UtilityConfig.create({ guildId }).then(res => utilConfig = res));
        if (!fmConfig) creations.push(FiveMConfig.create({ guildId }).then(res => fmConfig = res));
        if (!twConfig) creations.push(TwitchConfig.create({ guildId }).then(res => twConfig = res));

        if (creations.length > 0) {
            await Promise.all(creations);
        }

        res.json({
            success: true,
            data: {
                whitelist: mergeModuleDefaults('whitelist', wlConfig),
                tickets: mergeModuleDefaults('tickets', tkConfig),
                photocontest: mergeModuleDefaults('photocontest', photoConfig), // Consistent lowercase key
                verify: mergeModuleDefaults('verify', verifyConfig),
                guild: guildData,
                globalConfig,
                welcome: mergeModuleDefaults('welcome', wlcmConfig),
                utility: mergeModuleDefaults('utility', utilConfig),
                fivem: mergeModuleDefaults('fivem', fmConfig),
                twitch: twConfig
            }
        });

    } catch (error) {
        console.error('Error fetching configurations:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare le impostazioni. Verifica la connessione al database o ricarica la pagina.' });
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
        
        res.json({ success: true, data: mergeModuleDefaults('whitelist', config) });
    } catch (error) {
        console.error('Error fetching whitelist configuration:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione whitelist' });
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
        
        res.json({ success: true, data: mergeModuleDefaults('background', config) }); // Background uses its own defaults now
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

        const panelData = config?.embeds?.panel || {
            title: '📖 Archivio Storico - Deposito Background',
            description: 'Carica qui la storia del tuo personaggio.',
            color: '#5865F2'
        };

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
        const submitButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('start_background')
                .setLabel('Invia Background')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📖')
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

        // 3. LOG INPUT
        console.log(`[DEBUG_WHITELIST_POST] Body:`, JSON.stringify(req.body, null, 2));
        console.log(`[DEBUG_WHITELIST_POST] ValidatedData:`, JSON.stringify(req.validatedData, null, 2));

        // 4. VALIDAZIONE SICURA
        const data = req.validatedData || req.body;

        if (!data) {
            throw new Error('Dati della richiesta mancanti o non validi.');
        }

        // 4b. CLEANUP - Prevent Mongoose immutable field errors
        if (data._id) delete data._id;
        if (data.__v !== undefined) delete data.__v;

        // 5. CHECK FIELDS
        if (data.questions && !Array.isArray(data.questions)) {
            console.warn('[DEBUG_WHITELIST_POST] Warning: questions is not an array!');
        }
        
        if (data.embeds) {
            console.log('[DEBUG_WHITELIST_POST] Embeds config detected');
        }

        const config = await WhitelistConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        
        if (!config) {
            throw new Error('Impossibile trovare o creare la configurazione (Config null after update).');
        }

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_WHITELIST', data);
        
        res.json({ success: true, data: config });
    } catch (error) {
        // 2. LOG ERRORI
        console.error('[CRITICAL_WHITELIST_UPDATE_ERROR]:', error);
        if (error.stack) console.error(error.stack);

        // 6. RESPONSE DEBUG
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack,
            hint: 'Controlla i log del server per i dettagli del body e della validazione.'
        });
    }
});

// POST send whitelist panel
router.post('/:guildId/whitelist/send-panel', adminCheck, async (req, res) => {
    try {
        // 3. LOG BODY RECEIVED
        console.log(`[DEBUG_API] ${req.method} ${req.url} received body:`, JSON.stringify(req.body, null, 2));

        const { guildId } = req.params;
        const { channelId } = req.body;
        const config = await WhitelistConfig.findOne({ guildId });
        
        const targetChannelId = channelId || (config?.panelChannelId);
        
        if (!targetChannelId) {
            return res.status(400).json({ success: false, error: 'Canale non specificato nella richiesta e non configurato nel database.' });
        }

        const panelData = config?.embeds?.panel || {
            title: config?.title || 'Sistema Whitelist',
            description: config?.description || 'Clicca il pulsante qui sotto per iniziare la tua candidatura.',
            color: config?.color || '#5865F2'
        };

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

        // IMPORTANT: Only send the START button for the panel (e.g. APPLY_WHITELIST or start_wl)
        const globalRef = await GlobalConfig.findOne({ guildId });
        const allButtons = globalRef?.ui?.whitelistButtons || [];
        
        const startBtnConfig = allButtons.find(b => 
            b.customId.toLowerCase().includes('apply') || 
            b.customId.toLowerCase().includes('start')
        ) || { customId: 'start_wl', label: 'Inizia Candidatura', style: 'PRIMARY', emoji: '⚖️' };

        const startButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(startBtnConfig.customId)
                .setLabel(startBtnConfig.label)
                .setStyle(ButtonStyle[startBtnConfig.style] || ButtonStyle.Primary) // Resolve string to enum
                .setEmoji(startBtnConfig.emoji || '⚖️')
        );

        // --- ROBUST BULK CLEANUP ---
        try {
            console.log(`[DEBUG_WL_CLEANUP] Scanning for existing panels in <#${targetChannelId}>...`);
            const messages = await channel.messages.fetch({ limit: 50 });
            const legacyPanels = messages.filter(m => 
                m.author.id === client.user.id && 
                m.components.some(row => row.components.some(c => 
                    c.customId === 'start_wl' || 
                    c.customId === 'apply_whitelist' ||
                    c.customId === startBtnConfig.customId
                ))
            );

            if (legacyPanels.size > 0) {
                console.log(`[DEBUG_WL_CLEANUP] Found ${legacyPanels.size} legacy panels. Purging...`);
                for (const m of legacyPanels.values()) {
                    await m.delete().catch(err => console.warn(`[DEBUG_WL_CLEANUP] Failed to delete message ${m.id}: ${err.message}`));
                }
            } else {
                console.log(`[DEBUG_WL_CLEANUP] No legacy panels found via scan.`);
            }
        } catch (err) {
            console.error(`[DEBUG_WL_CLEANUP] Bulk scan failed:`, err.message);
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
        res.json({ success: true, data: mergeModuleDefaults('tickets', config) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione tickets' });
    }
});

// POST update tickets config
router.post('/:guildId/tickets', adminCheck, validate(ticketSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
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

        const panelData = config.embeds?.panel || {
            title: '🎫 Centro Assistenza',
            description: 'Apri un ticket selezionando una categoria.',
            color: '#3498db'
        };

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
                    options.push({
                        label: id.charAt(0).toUpperCase() + id.slice(1),
                        value: `ticket_type_${id}`,
                        emoji: data.emoji || '🎫'
                    });
                }
            } else {
                 options.push({ label: 'Supporto Generale', value: 'ticket_type_supporto', emoji: '🎫' });
            }

            components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('open_ticket_select')
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
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ticket_type_${id}`)
                            .setLabel(id.charAt(0).toUpperCase() + id.slice(1))
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(data.emoji || '🎫')
                    );
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

// GET photo contest config
router.get('/:guildId/photocontest', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await PhotoContestConfig.findOne({ guildId });
        if (!config) config = await PhotoContestConfig.create({ guildId });
        res.json({ success: true, data: mergeModuleDefaults('photocontest', config) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione photocontest' });
    }
});

// POST update photo contest config
router.post('/:guildId/photocontest', adminCheck, validate(photoContestSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const config = await PhotoContestConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
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
        res.json({ success: true, data: mergeModuleDefaults('verify', config) });
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

        const embed = new EmbedBuilder()
            .setTitle(config.embed.title || '✅ Verifica Account')
            .setDescription(config.embed.description || 'Clicca il bottone qui sotto per verificarti.')
            .setColor(config.embed.color?.startsWith('#') ? config.embed.color : '#2ecc71')
            .setTimestamp()
            .setFooter({ text: guild.name, iconURL: guild.iconURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_user')
                .setLabel('Verificati Ora')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Success)
        );

        // --- ROBUST BULK CLEANUP (Verify) ---
        try {
            console.log(`[DEBUG_VERIFY_CLEANUP] Scanning for existing panels in <#${config.channelId}>...`);
            const messages = await channel.messages.fetch({ limit: 50 });
            const legacyPanels = messages.filter(m => 
                m.author.id === client.user.id && 
                m.components.some(row => row.components.some(c => 
                    c.customId === 'verify_user' || 
                    c.customId === 'setup-verify'
                ))
            );

            if (legacyPanels.size > 0) {
                console.log(`[DEBUG_VERIFY_CLEANUP] Found ${legacyPanels.size} legacy panels. Purging...`);
                for (const m of legacyPanels.values()) {
                    await m.delete().catch(err => console.warn(`[DEBUG_VERIFY_CLEANUP] Failed message deletion: ${err.message}`));
                }
            }
        } catch (err) {
            console.error(`[DEBUG_VERIFY_CLEANUP] Bulk scan failed:`, err.message);
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
        const config = await GlobalConfig.findOneAndUpdate(
            { guildId },
            { $set: req.validatedData },
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
        res.json({ success: true, data: mergeModuleDefaults('welcome', config) });
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

// GET twitch config
router.get('/:guildId/twitch', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        let config = await TwitchConfig.findOne({ guildId });
        
        if (!config) {
            config = await TwitchConfig.create({ guildId });
        }
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error fetching twitch configuration:', error);
        res.status(500).json({ success: false, error: 'Impossibile caricare la configurazione twitch' });
    }
});

// POST update twitch config
router.post('/:guildId/twitch', adminCheck, validate(twitchSchema), async (req, res) => {
    try {
        const { guildId } = req.params;
        const data = req.validatedData || req.body;

        if (data._id) delete data._id;
        if (data.__v !== undefined) delete data.__v;

        const config = await TwitchConfig.findOneAndUpdate(
            { guildId },
            { $set: data },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        invalidateCache(guildId);
        await logAudit(req, 'UPDATE_TWITCH', data);
        
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Error updating twitch configuration:', error);
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

// GET audit logs
router.get('/:guildId/audit-logs', adminCheck, async (req, res) => {
    try {
        const logs = await DashboardAuditLog.find({ guildId: req.params.guildId })
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
            VoiceQueue.countDocuments({ guildId })
        ]);

        res.json({
            openTickets,
            pendingWhitelist: pendingWL,
            activeVoiceSessions: activeVoice
        });
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero delle statistiche: riprova tra qualche secondo.' });
    }
});

// GET Discord metadata (Roles and Channels) for selectors
router.get('/:guildId/discord-data', adminCheck, async (req, res) => {
    try {
        const { guildId } = req.params;
        const client = req.discordClient;
        
        // 1. Check if bot is ready
        if (!client.isReady()) {
            return res.status(503).json({ 
                success: false, 
                error: 'Il bot si sta ancora avviando. Riprova tra qualche secondo.' 
            });
        }

        // 2. Check bot presence in guild cache first for immediate feedback
        if (!client.guilds.cache.has(guildId)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Il bot non è presente in questo server. Assicurati di averlo invitato correttamente.' 
            });
        }

        // 3. Robust Fetch
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) {
            return res.status(404).json({ 
                success: false, 
                error: 'Impossibile recuperare i dettagli del server. Verifica i permessi del bot.' 
            });
        }

        // 4. Forced Data Fetching (Parallel)
        const [rolesFetched, channelsFetched] = await Promise.all([
            guild.roles.fetch().catch(err => {
                console.error(`[ERROR] Failed to fetch roles for ${guildId}:`, err);
                return guild.roles.cache;
            }),
            guild.channels.fetch().catch(err => {
                console.error(`[ERROR] Failed to fetch channels for ${guildId}:`, err);
                return guild.channels.cache;
            })
        ]);

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
                type: c.type 
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // 7. Enhanced Empty State Check & Debug
        if (roles.length === 0 && channels.length === 0) {
            let errorMsg = 'Nessun ruolo o canale trovato.';
            if (!viewChannels) errorMsg += ' Attenzione: Il bot non ha il permesso "Visualizza Canali".';
            if (!manageRoles) errorMsg += ' Attenzione: Il bot non ha il permesso "Gestisci Ruoli".';
            
            console.warn(`[DEBUG API] Guild ${guildId}: Empty results. ManageRoles: ${manageRoles}, ViewChannels: ${viewChannels}`);
            return res.status(200).json({ success: true, warning: errorMsg, data: { roles: [], channels: [] } });
        }

        console.log(`[DEBUG API] Guild ${guildId}: detected ${roles.length} roles and ${channels.length} channels (Types: 0, 2, 4, 5).`);

        res.json({ 
            success: true, 
            data: { 
                roles, 
                channels,
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
        res.json({ success: true, data: mergeModuleDefaults('fivem', config) });
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
            { new: true, upsert: true }
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

export default router;
