import mongoose from 'mongoose';
import logger from './logger.js';

const SHUTDOWN_TIMEOUT_MS = 15000;

let shuttingDown = false;

const stopManager = async (label, manager) => {
    if (!manager?.stop) return;

    try {
        await manager.stop();
    } catch (error) {
        logger.error(`[Shutdown] Failed to stop ${label}:`, error);
    }
};

export const installRuntimeGuards = (client) => {
    process.on('unhandledRejection', (reason) => {
        logger.error('[Runtime] Unhandled promise rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
        logger.error('[Runtime] Uncaught exception:', error);
        shutdown(client, 'uncaughtException', 1);
    });

    process.on('SIGINT', () => shutdown(client, 'SIGINT', 0));
    process.on('SIGTERM', () => shutdown(client, 'SIGTERM', 0));
};

export const shutdown = async (client, reason = 'unknown', exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.warn(`[Shutdown] Starting graceful shutdown (${reason})...`);

    const forceExit = setTimeout(() => {
        logger.error(`[Shutdown] Timed out after ${SHUTDOWN_TIMEOUT_MS}ms. Forcing exit.`);
        process.exit(exitCode || 1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
        await Promise.allSettled([
            stopManager('cleanupManager', client.cleanupManager),
            stopManager('embedScheduler', client.embedScheduler),
            stopManager('automationManager', client.automationManager),
            stopManager('analyticsManager', client.analyticsManager),
            stopManager('socialManager', client.socialManager),
            stopManager('giveawayManager', client.giveawayManager),
            stopManager('pollManager', client.pollManager),
            stopManager('fivemManager', client.fivemManager)
        ]);

        if (client.multiBotManager?.instances) {
            for (const [guildId, privateClient] of client.multiBotManager.instances.entries()) {
                try {
                    privateClient.destroy();
                    client.multiBotManager.instances.delete(guildId);
                } catch (error) {
                    logger.error(`[Shutdown] Failed to destroy private bot ${guildId}:`, error);
                }
            }
        }

        if (client?.destroy) {
            client.destroy();
        }

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        logger.info('[Shutdown] Complete.');
        clearTimeout(forceExit);
        process.exit(exitCode);
    } catch (error) {
        logger.error('[Shutdown] Failed:', error);
        clearTimeout(forceExit);
        process.exit(exitCode || 1);
    }
};

export default installRuntimeGuards;
