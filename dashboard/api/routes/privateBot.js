import express from 'express';
import PrivateBot from '../../../src/models/PrivateBot.js';
import Guild from '../../../src/models/Guild.js';
import cryptoHelper from '../../../src/utils/cryptoHelper.js';
import logger from '../../../src/utils/logger.js';

const router = express.Router();

// Get private bot config for a guild
router.get('/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        
        // Check tier
        const guild = await Guild.findOne({ guildId });
        if (!guild || guild.premiumTier !== 'platinum') {
            return res.status(403).json({ success: false, error: 'Questa funzione richiede un abbonamento Platinum.' });
        }

        const bot = await PrivateBot.findOne({ guildId });
        if (!bot) {
            return res.json({ success: true, data: { bot: null } });
        }

        const botData = bot.toObject();
        delete botData.token;
        res.json({ success: true, data: { bot: botData } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch private bot config' });
    }
});

// Create or Update private bot
router.post('/:guildId', async (req, res) => {
    try {
        const { guildId } = req.params;
        const { token, enabled } = req.body;

        // Check tier
        const guild = await Guild.findOne({ guildId });
        if (!guild || guild.premiumTier !== 'platinum') {
            return res.status(403).json({ success: false, error: 'Il True White-label richiede un abbonamento Platinum.' });
        }

        let bot = await PrivateBot.findOne({ guildId });
        const encryptedToken = token ? cryptoHelper.encrypt(token) : (bot ? bot.token : null);

        if (!encryptedToken) {
            return res.status(400).json({ success: false, error: 'Token is required' });
        }

        if (bot) {
            bot.token = encryptedToken;
            bot.enabled = enabled !== undefined ? enabled : bot.enabled;
            await bot.save();
        } else {
            bot = new PrivateBot({
                userId: req.user.id,
                guildId,
                token: encryptedToken,
                enabled: enabled || false
            });
            await bot.save();
        }

        // Handle process management
        const multiBotManager = req.discordClient.multiBotManager;
        if (bot.enabled) {
            if (multiBotManager.instances.has(guildId)) {
                await multiBotManager.stopBot(guildId);
            }
            await multiBotManager.startBot(bot);
        } else {
            await multiBotManager.stopBot(guildId);
        }

        res.json({ success: true, message: 'Configurazione salvata con successo' });
    } catch (error) {
        logger.error('[API] Error saving private bot:', error);
        res.status(500).json({ success: false, error: 'Failed to save private bot' });
    }
});

// Toggle bot
router.post('/:guildId/toggle', async (req, res) => {
    try {
        const { guildId } = req.params;
        const bot = await PrivateBot.findOne({ guildId });

        if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });

        bot.enabled = !bot.enabled;
        await bot.save();

        const multiBotManager = req.discordClient.multiBotManager;
        if (bot.enabled) {
            await multiBotManager.startBot(bot);
        } else {
            await multiBotManager.stopBot(guildId);
        }

        res.json({ success: true, data: { enabled: bot.enabled } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Toggle failed' });
    }
});

// Restart bot
router.post('/:guildId/restart', async (req, res) => {
    try {
        const { guildId } = req.params;
        const bot = await PrivateBot.findOne({ guildId });

        if (!bot) return res.status(404).json({ success: false, error: 'Bot not found' });
        if (!bot.enabled) return res.status(400).json({ success: false, error: 'Bot is disabled' });

        const multiBotManager = req.discordClient.multiBotManager;
        
        // Restart sequence
        await multiBotManager.stopBot(guildId);
        await multiBotManager.startBot(bot);

        res.json({ success: true, message: 'Bot riavviato con successo' });
    } catch (error) {
        logger.error('[API] Restart failed:', error);
        res.status(500).json({ success: false, error: 'Restart failed' });
    }
});

export default router;
