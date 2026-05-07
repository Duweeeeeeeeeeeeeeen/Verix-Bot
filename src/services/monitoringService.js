import logger from '../utils/logger.js';
import os from 'os';

class MonitoringService {
    constructor(client) {
        this.client = client;
        this.ownerId = process.env.OWNER_ID || process.env.BOT_OWNER_ID;
        this.checkInterval = 1000 * 60 * 30; // Check every 30 minutes
    }

    async init() {
        if (!this.ownerId) {
            logger.warn('[Monitoring] OWNER_ID/BOT_OWNER_ID not set. Monitoring alerts disabled.');
            return;
        }

        logger.info('[Monitoring] Service initialized.');
        this.startResourceCheck();
    }

    async sendAlert(message, type = 'INFO') {
        try {
            const owner = await this.client.users.fetch(this.ownerId);
            if (!owner) return;

            const emoji = {
                'INFO': 'ℹ️',
                'WARN': '⚠️',
                'ERROR': '🚨',
                'SUCCESS': '✅'
            }[type] || '🔔';

            await owner.send(`${emoji} **VERIX SYSTEM ALERT** [${type}]\n${message}`);
        } catch (error) {
            logger.error('[Monitoring] Failed to send alert to owner:', error.message);
        }
    }

    startResourceCheck() {
        setInterval(async () => {
            const freeMem = os.freemem() / os.totalmem();
            if (freeMem < 0.1) { // Less than 10% RAM free
                await this.sendAlert(`La memoria RAM sulla VPS è critica: ${(freeMem * 100).toFixed(1)}% rimanente.`, 'WARN');
            }
        }, this.checkInterval);
    }

    async notifyPrivateBotError(guildId, error) {
        await this.sendAlert(`Errore critico nel Private Bot per la Guild **${guildId}**:\n\`\`\`${error}\`\`\``, 'ERROR');
    }
}

export default MonitoringService;
