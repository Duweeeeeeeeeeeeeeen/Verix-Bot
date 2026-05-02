import express from 'express';
import { ownerCheck } from '../middleware/ownerCheck.js';
import GlobalConfig from '../../../src/models/GlobalConfig.js';
import { EmbedBuilder } from 'discord.js';
import logger from '../../../src/utils/logger.js';
import SystemBroadcast from '../../../src/models/SystemBroadcast.js';

const router = express.Router();

/**
 * POST /api/system/broadcast
 * Sends an update announcement to all servers' log channels.
 */
router.post('/broadcast', ownerCheck, async (req, res) => {
    try {
        const { title, version, description, changes, type, thumbnail, image } = req.body;
        const client = req.discordClient;

        if (!description) {
            return res.status(400).json({ success: false, error: 'La descrizione è obbligatoria.' });
        }

        // Fetch all guild configs that have a log channel
        const configs = await GlobalConfig.find({ 
            'logs.enabled': true, 
            'logs.channelId': { $ne: null } 
        });

        const stats = {
            attempted: configs.length,
            success: 0,
            failed: 0
        };

        const embed = new EmbedBuilder()
            .setTitle(title || `🚀 Nuova Patch: v${version || '1.0.0'}`)
            .setDescription(description)
            .setColor(type === 'emergency' ? 0xFF0000 : 0x00FF00)
            .setTimestamp()
            .setFooter({ text: 'Verix System Updates', iconURL: client.user.displayAvatarURL() });

        if (thumbnail) embed.setThumbnail(thumbnail);
        if (image) embed.setImage(image);

        if (changes && Array.isArray(changes) && changes.length > 0) {
            embed.addFields({ 
                name: '🛠️ Changelog', 
                value: changes.map(c => `• ${c}`).join('\n') 
            });
        }

        // Broadcast to all guilds
        for (const config of configs) {
            try {
                const guild = client.guilds.cache.get(config.guildId);
                if (!guild) continue;

                const channel = guild.channels.cache.get(config.logs.channelId);
                if (!channel || !channel.isTextBased()) continue;

                await channel.send({ embeds: [embed] });
                stats.success++;
            } catch (err) {
                logger.error(`[System_Broadcast] Failed to send to guild ${config.guildId}:`, err.message);
                stats.failed++;
            }
        }

        res.json({
            success: true,
            message: `Annuncio inviato con successo a ${stats.success} server.`,
            stats
        });

        // Stash the broadcast in the database
        try {
            await SystemBroadcast.create({
                title: title || `Nuova Patch: v${version || '1.0.0'}`,
                version: version || '1.0.0',
                description,
                changes: changes || [],
                type: type || 'standard',
                thumbnail,
                image,
                sentBy: req.user.id,
                stats: {
                    success: stats.success,
                    failed: stats.failed
                }
            });
        } catch (dbErr) {
            logger.error('[System_API] Failed to stash broadcast:', dbErr);
        }

    } catch (error) {
        console.error('[System_API] Broadcast Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante l\'invio del broadcast.' });
    }
});

/**
 * GET /api/system/status
 * Returns global bot stats (only for owner)
 */
router.get('/status', ownerCheck, async (req, res) => {
    const client = req.discordClient;
    res.json({
        success: true,
        data: {
            guilds: client.guilds.cache.size,
            users: client.users.cache.size,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            ping: client.ws.ping
        }
    });
});

/**
 * GET /api/system/history
 * Returns the list of past broadcasts (only for owner)
 */
router.get('/history', ownerCheck, async (req, res) => {
    try {
        const history = await SystemBroadcast.find().sort({ sentAt: -1 }).limit(50);
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Errore nel recupero della cronologia.' });
    }
});

export default router;
