import express from 'express';
import EmbedTemplate from '../../../src/models/EmbedTemplate.js';
import ScheduledEmbed from '../../../src/models/ScheduledEmbed.js';
import Guild from '../../../src/models/Guild.js';
import DashboardAuditLog from '../../../src/models/DashboardAuditLog.js';
import { adminCheck } from '../middleware/adminCheck.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { invalidateCache } from '../../../src/core/configCache.js';

// Centralized Utilities
import { validate } from '../middleware/validate.js';
import { logAudit } from '../utils/auditLogger.js';

// Validations
import { templateSchema, sendEmbedSchema } from '../validations/embedSchema.js';
import { checkBotPermissions, formatMissingPermissions } from '../../../src/utils/permissionHelper.js';

const router = express.Router();

const sendEmbedError = (res, status, error, details = undefined) => {
    const payload = { success: false, error };
    if (details) payload.details = details;
    return res.status(status).json(payload);
};

// GET all templates for a guild
router.get('/:guildId/templates', adminCheck, async (req, res) => {
    try {
        const templates = await EmbedTemplate.find({ guildId: req.params.guildId });
        res.json(templates);
    } catch (error) {
        sendEmbedError(res, 500, 'Unable to load embed templates.');
    }
});

// POST save/update a template
router.post('/:guildId/templates', adminCheck, validate(templateSchema), async (req, res) => {
    try {
        const { id, name, targetChannelId, data } = req.validatedData;
        const guildId = req.params.guildId;
        let template;
        
        const updateFields = { name, data };
        if (targetChannelId !== undefined) updateFields.targetChannelId = targetChannelId;

        if (id) {
            template = await EmbedTemplate.findOneAndUpdate({ _id: id, guildId }, { $set: updateFields }, { returnDocument: 'after' });
            if (!template) return sendEmbedError(res, 404, 'Embed template not found.');
            await logAudit(req, 'UPDATE_TEMPLATE', { name, id });
        } else {
            const isPremium = (await Guild.findOne({ guildId }))?.isPremium;
            const count = await EmbedTemplate.countDocuments({ guildId });

            if (!isPremium && count >= 3) {
                return sendEmbedError(res, 403, 'Free tier limit: 3 templates. Upgrade to PRO for more.');
            }

            template = await EmbedTemplate.create({ guildId, name, targetChannelId, data });
            await logAudit(req, 'CREATE_TEMPLATE', { name });
        }

        invalidateCache(guildId);
        res.json(template);
    } catch (error) {
        sendEmbedError(res, 500, 'Unable to save the embed template.');
    }
});

// DELETE a template
router.delete('/:guildId/templates/:id', adminCheck, async (req, res) => {
    try {
        const guildId = req.params.guildId;
        const template = await EmbedTemplate.findOneAndDelete({ _id: req.params.id, guildId });
        if (!template) return sendEmbedError(res, 404, 'Embed template not found.');

        await logAudit(req, 'DELETE_TEMPLATE', { name: template.name, id: template._id });
        
        invalidateCache(guildId);
        res.json({ success: true });
    } catch (error) {
        sendEmbedError(res, 500, 'Unable to delete the embed template.');
    }
});

// GET channels for a guild
router.get('/:guildId/channels', adminCheck, async (req, res) => {
    try {
        const client = req.discordClient;
        const guild = await client.guilds.fetch(req.params.guildId).catch(() => null);

        if (!guild) return sendEmbedError(res, 404, 'Bot is not available in this server.');

        const channelsFetched = await guild.channels.fetch().catch(() => guild.channels.cache);
        const channels = channelsFetched
            .filter(c => c.type === 0 || c.type === 5) // Text or Announcement
            .map(c => ({
                id: c.id,
                name: c.name,
                type: c.type,
                position: c.position
            }))
            .sort((a, b) => a.position - b.position);

        console.log(`[DEBUG API] Guild ${req.params.guildId}: fetched ${channels.length} channels for embeds select.`);
        res.json(channels);
    } catch (error) {
        sendEmbedError(res, 500, 'Unable to load Discord channels.');
    }
});

// POST send embed to channel
router.post('/:guildId/send', adminCheck, validate(sendEmbedSchema), async (req, res) => {
    try {
        const { channelId, embed, schedule } = req.validatedData;
        const guildId = req.params.guildId;
        const client = req.discordClient;

        // --- SCHEDULING LOGIC ---
        if (schedule && (schedule.type === 'DELAY' || schedule.type === 'TIME')) {
            let scheduledAt;
            if (schedule.type === 'DELAY') {
                scheduledAt = new Date(Date.now() + schedule.delayMinutes * 60000);
            } else {
                scheduledAt = new Date(schedule.specificTime);
            }

            if (isNaN(scheduledAt.getTime())) {
                return sendEmbedError(res, 400, 'Invalid scheduled date.');
            }

            if (scheduledAt <= new Date()) {
                return sendEmbedError(res, 400, 'Scheduled date must be in the future.');
            }

            const newSchedule = await ScheduledEmbed.create({
                guildId,
                channelId,
                embed,
                scheduledAt,
                recurrence: schedule.recurrence || 'none',
                createdBy: req.user.id
            });

            await logAudit(req, 'SCHEDULE_EMBED', { channelId, scheduledAt, title: embed.title });
            return res.json({ success: true, message: 'Embed scheduled successfully!', data: newSchedule });
        }
        
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) return sendEmbedError(res, 404, 'Channel not found or not accessible by the bot.');

        // --- PERMISSION CHECK ---
        const permCheck = checkBotPermissions(channel, [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ]);

        if (!permCheck.hasPermission) {
            return sendEmbedError(res, 403, 'Missing bot permissions in the selected Discord channel.', permCheck.missing);
        }

        const discordEmbed = new EmbedBuilder();
        if (embed.title) discordEmbed.setTitle(embed.title);
        if (embed.description) discordEmbed.setDescription(embed.description);
        if (embed.color) discordEmbed.setColor(embed.color);
        if (embed.image) discordEmbed.setImage(embed.image);
        if (embed.thumbnail) discordEmbed.setThumbnail(embed.thumbnail);
        if (embed.footer) discordEmbed.setFooter({ text: embed.footer });
        
        if (embed.fields && Array.isArray(embed.fields)) {
            discordEmbed.addFields(embed.fields.filter(f => f.name && f.value));
        }

        const messageOptions = { embeds: [discordEmbed] };

        // --- BUTTON LOGIC ---
        if (embed.button && embed.button.label) {
            const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = await import('discord.js');
            
            const buttonStyle = embed.button.style === 'LINK' ? ButtonStyle.Link : (
                embed.button.style === 'SUCCESS' ? ButtonStyle.Success :
                embed.button.style === 'DANGER' ? ButtonStyle.Danger :
                embed.button.style === 'SECONDARY' ? ButtonStyle.Secondary : ButtonStyle.Primary
            );

            const button = new ButtonBuilder()
                .setLabel(embed.button.label)
                .setStyle(buttonStyle);

            if (embed.button.emoji) button.setEmoji(embed.button.emoji);
            
            if (embed.button.style === 'LINK') {
                if (embed.button.url) button.setURL(embed.button.url);
            } else {
                button.setCustomId(`manual_embed_btn_${Date.now()}`);
            }

            const row = new ActionRowBuilder().addComponents(button);
            messageOptions.components = [row];
        }

        await channel.send(messageOptions);
        await logAudit(req, 'SEND_MANUAL_EMBED', { channelId, title: embed.title });
        
        res.json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        sendEmbedError(res, 500, 'Unable to send the embed message.');
    }
});

export default router;
