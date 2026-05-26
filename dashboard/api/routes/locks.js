import express from 'express';
import { adminCheck, nativeAdminCheck } from '../middleware/adminCheck.js';
import ModuleLock from '../../../src/models/ModuleLock.js';
import logger from '../../../src/utils/logger.js';

const router = express.Router();

/**
 * POST /api/locks/:guildId/:module/acquire
 * Acquire an edit lock on a module
 */
router.post('/:guildId/:module/acquire', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        const userId = req.user.id;
        const username = req.user.username;
        const now = new Date();

        // 1. Look for existing active lock
        const existingLock = await ModuleLock.findOne({
            guildId,
            module,
            expiresAt: { $gt: now }
        });

        // 2. If locked by another user, return conflict
        if (existingLock && existingLock.userId !== userId) {
            return res.status(423).json({
                success: false,
                message: 'Sezione bloccata da un altro collaboratore.',
                lock: {
                    username: existingLock.username,
                    userId: existingLock.userId,
                    expiresAt: existingLock.expiresAt
                }
            });
        }

        // 3. Otherwise, set/renew lock for 30 seconds
        const expiresAt = new Date(Date.now() + 30000); // 30s lock duration

        const lock = await ModuleLock.findOneAndUpdate(
            { guildId, module },
            { userId, username, expiresAt },
            { upsert: true, returnDocument: 'after' }
        );

        res.json({
            success: true,
            lock: {
                username: lock.username,
                userId: lock.userId,
                expiresAt: lock.expiresAt
            }
        });
    } catch (error) {
        logger.error('[Locks_API] Lock Acquire Error:', error);
        res.status(500).json({ success: false, error: 'Unable to acquire the edit lock.' });
    }
});

/**
 * POST /api/locks/:guildId/:module/heartbeat
 * Keep a lock alive
 */
router.post('/:guildId/:module/heartbeat', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        const userId = req.user.id;

        const expiresAt = new Date(Date.now() + 30000); // Extend by 30s

        // Ensure the current user holds the lock or it is expired
        const existingLock = await ModuleLock.findOne({ guildId, module });

        if (existingLock && existingLock.userId !== userId && existingLock.expiresAt > new Date()) {
            return res.status(423).json({
                success: false,
                message: 'Blocco scaduto o acquisito da qualcun altro.',
                lock: {
                    username: existingLock.username,
                    userId: existingLock.userId,
                    expiresAt: existingLock.expiresAt
                }
            });
        }

        const lock = await ModuleLock.findOneAndUpdate(
            { guildId, module },
            { userId, username: req.user.username, expiresAt },
            { upsert: true, returnDocument: 'after' }
        );

        res.json({
            success: true,
            lock: {
                username: lock.username,
                userId: lock.userId,
                expiresAt: lock.expiresAt
            }
        });
    } catch (error) {
        logger.error('[Locks_API] Heartbeat Error:', error);
        res.status(500).json({ success: false, error: 'Error while renewing the lock.' });
    }
});

/**
 * DELETE /api/locks/:guildId/:module/release
 * Release a lock explicitly
 */
router.delete('/:guildId/:module/release', adminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;
        const userId = req.user.id;

        // Delete lock only if it is held by the current user
        const result = await ModuleLock.deleteOne({
            guildId,
            module,
            userId
        });

        res.json({
            success: true,
            released: result.deletedCount > 0
        });
    } catch (error) {
        logger.error('[Locks_API] Lock Release Error:', error);
        res.status(500).json({ success: false, error: 'Error while releasing the lock.' });
    }
});

/**
 * POST /api/locks/:guildId/:module/force-unlock
 * Force release a lock (Discord Admin override)
 */
router.post('/:guildId/:module/force-unlock', nativeAdminCheck, async (req, res) => {
    try {
        const { guildId, module } = req.params;

        const result = await ModuleLock.deleteOne({
            guildId,
            module
        });

        res.json({
            success: true,
            released: result.deletedCount > 0,
            message: 'Blocco rimosso forzatamente dall\'Amministratore.'
        });
    } catch (error) {
        logger.error('[Locks_API] Force Unlock Error:', error);
        res.status(500).json({ success: false, error: 'Error while force unlocking.' });
    }
});

export default router;
