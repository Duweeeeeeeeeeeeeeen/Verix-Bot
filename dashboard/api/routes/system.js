import express from 'express';
import fsSync from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { ownerCheck } from '../middleware/ownerCheck.js';
import GlobalConfig from '../../../src/models/GlobalConfig.js';
import { EmbedBuilder } from 'discord.js';
import logger from '../../../src/utils/logger.js';
import SystemBroadcast from '../../../src/models/SystemBroadcast.js';
import Guild from '../../../src/models/Guild.js';
import { invalidateCache } from '../../../src/core/configCache.js';
import buildHealthStatus from '../../../src/utils/healthStatus.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${uuidv4()}${ext}`;
        cb(null, fileName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato file non supportato. Carica un\'immagine (JPG, PNG, GIF, WEBP).'));
        }
    }
});

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

/**
 * POST /api/system/upload
 * Handles internal image uploads.
 */
router.post('/upload', ownerCheck, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Nessun file caricato.' });
        }

        const fileName = req.file.filename;
        const baseUrl = (process.env.API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
        const url = `${baseUrl}/uploads/${fileName}`;

        res.json({
            success: true,
            url: url,
            fileName: fileName
        });
    } catch (error) {
        logger.error('[System_API] Upload Error:', error);
        res.status(500).json({ success: false, error: 'Errore durante il caricamento dell\'immagine.' });
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

router.get('/health', ownerCheck, async (req, res) => {
    res.json({ success: true, data: buildHealthStatus(req.discordClient) });
});

/**
 * GET /api/system/guild/:guildId
 * Returns guild premium status and tier (only for owner)
 */
router.get('/guild/:guildId', ownerCheck, async (req, res) => {
    try {
        const guild = await Guild.findOne({ guildId: req.params.guildId });
        res.json({ success: true, data: guild || { isPremium: false, premiumTier: 'none' } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/system/guild/:guildId/tier
 * Sets the premium tier and automatically updates isPremium flag
 */
router.post('/guild/:guildId/tier', ownerCheck, async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['none', 'lite', 'premium', 'platinum'].includes(tier)) {
            return res.status(400).json({ success: false, error: 'Tier non valido.' });
        }

        const isPremium = tier !== 'none';
        
        const guild = await Guild.findOneAndUpdate(
            { guildId: req.params.guildId },
            { $set: { premiumTier: tier, isPremium } },
            { returnDocument: 'after', upsert: true }
        );

        invalidateCache(req.params.guildId);
        res.json({ success: true, data: guild });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/system/guild/:guildId/premium
 * (Legacy) Toggles premium status
 */
router.post('/guild/:guildId/premium', ownerCheck, async (req, res) => {
    try {
        const { isPremium } = req.body;
        const tier = isPremium ? 'premium' : 'none';
        const guild = await Guild.findOneAndUpdate(
            { guildId: req.params.guildId },
            { $set: { isPremium, premiumTier: tier } },
            { returnDocument: 'after', upsert: true }
        );
        invalidateCache(req.params.guildId);
        res.json({ success: true, data: guild });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/system/logs
 * Reads the bot log file from the VPS filesystem.
 */
router.get('/logs', ownerCheck, async (req, res) => {
    try {
        // Absolute path to the log file on the VPS/Local
        const logPath = 'e:\\BOT Discord\\bot.log';
        
        try {
            const stats = await fs.stat(logPath);
            const fileSize = stats.size;
            
            // Read the last 64KB of the file
            const readSize = Math.min(fileSize, 64 * 1024);
            const buffer = Buffer.alloc(readSize);
            const fileHandle = await fs.open(logPath, 'r');
            
            await fileHandle.read(buffer, 0, readSize, fileSize - readSize);
            await fileHandle.close();
            
            let content = buffer.toString('utf8');
            
            // If we didn't read from the start, trim the first partial line
            if (readSize < fileSize) {
                const firstNewline = content.indexOf('\n');
                if (firstNewline !== -1) {
                    content = content.substring(firstNewline + 1);
                }
            }
            
            res.json({ success: true, data: content });
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.json({ success: true, data: "Log file not found at: " + logPath });
            }
            throw err;
        }
    } catch (error) {
        logger.error('[SystemAPI] Log read error:', error);
        res.status(500).json({ success: false, error: 'Failed to read logs: ' + error.message });
    }
});

export default router;
