import express from 'express';
import MessageConfig from '../../../src/models/MessageConfig.js';
import messageService from '../../../src/utils/messageService.js';
import { getDefaultMessages } from '../../../src/locales/t.js';
import { adminCheck } from '../middleware/adminCheck.js';

const router = express.Router();

/**
 * GET /api/messages/:guildId/:module
 * Fetch messages for a specific module and guild.
 */
router.get('/:guildId/:module', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        const config = await MessageConfig.findOne({ guildId, module }).lean();
        
        // Fetch guild language and get localized defaults
        const lang = await messageService.getGuildLanguage(guildId);
        const defaults = getDefaultMessages(lang)[module] || {};
        
        // Convert Map to plain object properly
        const dbMessages = (config && config.messages) ? config.messages : {};

        // Merge defaults and DB overrides into a single flat object
        const mergedMessages = {};
        const allKeys = new Set([...Object.keys(defaults), ...Object.keys(dbMessages)]);

        allKeys.forEach(key => {
            const def = defaults[key] || {};
            const db = dbMessages[key] || {};

            // Helper to check if a value is a generic placeholder
            const isPlaceholder = (val) => !val || val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.';

            mergedMessages[key] = {
                ...def,
                ...db,
                // Force professional defaults if DB fields are TRULY empty or generic placeholders
                title: !isPlaceholder(db.title) ? db.title : (def.title || 'Senza Titolo'),
                description: !isPlaceholder(db.description) ? db.description : (def.description || 'Nessun contenuto impostato.'),
                color: db.color || def.color || '#5865F2',
                footer: !isPlaceholder(db.footer) ? db.footer : (def.footer || ''),
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
