import logger from '../utils/logger.js';
import os from 'os';
import mongoose from 'mongoose';
import { EmbedBuilder } from 'discord.js';
import SystemSettings from '../models/SystemSettings.js';

class MonitoringService {
    constructor(client) {
        this.client = client;
        this.ownerId = process.env.OWNER_ID || process.env.BOT_OWNER_ID;
        this.checkInterval = 1000 * 60 * 30; // Check every 30 minutes
        this.trackingIntervalId = null;
    }

    async init() {
        if (!this.ownerId) {
            logger.warn('[Monitoring] OWNER_ID/BOT_OWNER_ID not set. Monitoring alerts disabled.');
        } else {
            logger.info('[Monitoring] Alert service initialized.');
            this.startResourceCheck();
        }

        // Start live tracking status loop
        try {
            await this.startStatusTracking();
            logger.info('[Monitoring] Live Status Tracking service initialized.');
        } catch (err) {
            logger.error('[Monitoring] Failed to initialize live status tracking:', err);
        }
    }

    async sendAlert(message, type = 'INFO') {
        try {
            if (!this.ownerId) return;
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

    async startStatusTracking() {
        if (this.trackingIntervalId) {
            clearInterval(this.trackingIntervalId);
            this.trackingIntervalId = null;
        }

        // Setup global settings document if it doesn't exist
        let settings = await SystemSettings.findOne({ key: 'global' });
        if (!settings) {
            settings = await SystemSettings.create({ key: 'global' });
        }

        const runCycle = async () => {
            try {
                // Always fetch fresh settings to handle manual toggle from UI
                const currentSettings = await SystemSettings.findOne({ key: 'global' });
                if (!currentSettings || !currentSettings.trackingEnabled || !currentSettings.trackingChannelId) {
                    return;
                }

                const channel = await this.client.channels.fetch(currentSettings.trackingChannelId).catch(() => null);
                if (!channel || !channel.isTextBased()) {
                    logger.error(`[Monitoring] Status tracking channel ${currentSettings.trackingChannelId} not found or not text-based.`);
                    return;
                }

                // Build embed
                const dbState = mongoose.connection.readyState;
                const dbStatusText = {
                    0: 'Disconnected 🔴',
                    1: 'Connected 🟢',
                    2: 'Connecting 🟡',
                    3: 'Disconnecting 🔴'
                }[dbState] || 'Unknown ⚪';

                const discordPing = this.client.ws.ping;
                const discordPingText = discordPing !== -1 ? `${discordPing}ms ⚡` : 'N/A';

                const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
                const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
                const usedMem = (totalMem - freeMem).toFixed(1);
                const botMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

                // Format uptime
                const uptimeSec = Math.floor(process.uptime());
                const days = Math.floor(uptimeSec / 86400);
                const hours = Math.floor((uptimeSec % 86400) / 3600);
                const minutes = Math.floor((uptimeSec % 3600) / 60);
                const seconds = uptimeSec % 60;
                const uptimeText = `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;

                const embed = new EmbedBuilder()
                    .setTitle('🤖 VERIX LIVE TRACKING STATUS')
                    .setDescription(`Last Checked: <t:${Math.floor(Date.now() / 1000)}:R>`)
                    .setColor(dbState === 1 && discordPing !== -1 ? 0x10B981 : 0xEF4444)
                    .addFields(
                        { name: '🌐 Global Status', value: dbState === 1 ? 'ONLINE 🟢' : 'DEGRADED ⚠️', inline: true },
                        { name: '⏱️ Bot Uptime', value: `\`${uptimeText}\``, inline: true },
                        { name: '📡 Gateway Ping', value: `\`${discordPingText}\``, inline: true },
                        { name: '🗄️ Database', value: dbStatusText, inline: true },
                        { name: '👥 Cached Guilds', value: `\`${this.client.guilds.cache.size}\``, inline: true },
                        { name: '👤 Cached Users', value: `\`${this.client.users.cache.size}\``, inline: true },
                        { name: '📊 Bot memory (RSS)', value: `\`${botMem} MB\``, inline: true },
                        { name: '💻 VPS RAM Used', value: `\`${usedMem} GB / ${totalMem} GB\``, inline: true },
                        { name: '⚙️ Platform / CPU', value: `\`${os.platform()} (${os.arch()})\``, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Verix Live Monitoring System', iconURL: this.client.user.displayAvatarURL() });

                let messageEdited = false;
                if (currentSettings.lastStatusMessageId) {
                    try {
                        const msg = await channel.messages.fetch(currentSettings.lastStatusMessageId);
                        if (msg) {
                            await msg.edit({ embeds: [embed] });
                            messageEdited = true;
                        }
                    } catch (fetchErr) {
                        logger.warn(`[Monitoring] Status message ${currentSettings.lastStatusMessageId} not found, will send new one.`);
                    }
                }

                if (!messageEdited) {
                    const newMsg = await channel.send({ embeds: [embed] });
                    currentSettings.lastStatusMessageId = newMsg.id;
                    await currentSettings.save();
                }
            } catch (err) {
                logger.error('[Monitoring] Error in status tracking cycle:', err);
            }
        };

        const intervalSec = settings.trackingInterval || 60;

        // Run immediately once
        await runCycle();

        // Schedule interval
        this.trackingIntervalId = setInterval(runCycle, intervalSec * 1000);
    }

    async notifyPrivateBotError(guildId, error) {
        await this.sendAlert(`Critical error in Private Bot for Guild **${guildId}**:\n\`\`\`${error}\`\`\``, 'ERROR');
    }
}

export default MonitoringService;
