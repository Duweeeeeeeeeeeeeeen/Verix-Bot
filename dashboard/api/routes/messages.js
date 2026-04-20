import express from 'express';
import MessageConfig from '../../../src/models/MessageConfig.js';
import messageService from '../../../src/utils/messageService.js';
import defaultMessages from '../../../src/locales/defaultMessages.js';
import { adminCheck } from '../middleware/adminCheck.js';

const router = express.Router();

/**
 * GET /api/messages/:guildId/:module
 * Fetch messages for a specific module and guild.
 */
router.get('/:guildId/:module', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        const config = await MessageConfig.findOne({ guildId, module });
        
        const dbMessages = config ? (config.messages instanceof Map ? Object.fromEntries(config.messages) : config.messages) : {};
        const defaults = defaultMessages[module] || {};

        // Merge defaults and DB overrides into a single flat object
        const mergedMessages = {};
        const allKeys = new Set([...Object.keys(defaults), ...Object.keys(dbMessages)]);

        allKeys.forEach(key => {
            const def = defaults[key] || {};
            const db = dbMessages[key] || {};

            mergedMessages[key] = {
                ...def,
                ...db,
                // Ensure critical fields always have at least the professional default
                title: db.title || def.title || '',
                description: db.description || def.description || '',
                color: db.color || def.color || '#5865F2',
                footer: db.footer || def.footer || '',
                enabled: db.enabled !== undefined ? db.enabled : (def.enabled !== undefined ? def.enabled : true)
            };
        });

        res.json({
            success: true,
            data: mergedMessages
        });
    } catch (error) {
        console.error('[API] Error fetching messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/messages/:guildId/:module
 * Update messages for a specific module and guild.
 */
router.post('/:guildId/:module', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        const messages = req.body;

        const config = await MessageConfig.findOneAndUpdate(
            { guildId, module },
            { $set: { messages } },
            { upsert: true, new: true }
        );

        // Invalidate Bot Cache
        messageService.clearCache(guildId, module);

        res.json({
            success: true,
            data: config.messages
        });
    } catch (error) {
        console.error('[API] Error saving messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
