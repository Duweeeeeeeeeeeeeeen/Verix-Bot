import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import logger from '../../../utils/logger.js';
import { EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { t } from '../../../locales/t.js';

/**
 * Recovers active whitelist sessions after a bot restart.
 * @param {import('discord.js').Client} client 
 */
export async function recoverWhitelistSessions(client) {
    logger.info('Starting active whitelist session recovery...');
    
    if (mongoose.connection.readyState !== 1) {
        logger.warn('Skipping whitelist session recovery: database not connected.');
        return;
    }

    try {
        const pendingApps = await WhitelistApp.find({ status: 'PENDING' });
        
        if (pendingApps.length === 0) {
            logger.info('No pending whitelist sessions to recover.');
            return;
        }

        logger.info(`Found ${pendingApps.length} sessions to check.`);

        for (const app of pendingApps) {
            const config = await WhitelistConfig.findOne({ guildId: app.guildId });
            if (!config) {
                logger.warn(`Configuration not found for server ${app.guildId}. Skipping session.`);
                continue;
            }

            const globalConfig = await GlobalConfig.findOne({ guildId: app.guildId });
            const lang = globalConfig?.language || 'en';

            const now = Date.now();
            const startTime = app.startTime.getTime();
            const timeLimitMs = config.timeLimit * 60 * 1000;
            const expirationTime = startTime + timeLimitMs;
            const timeLeft = expirationTime - now;

            const guild = client.guilds.cache.get(app.guildId);
            if (!guild) {
                logger.warn(`Il bot non è più nel server ${app.guildId}. Salto la sessione.`);
                continue;
            }

            const channel = guild.channels.cache.get(app.channelId);

            if (timeLeft <= 0) {
                // Sessione scaduta durante il downtime
                logger.info(`Sessione ${app._id} (Utente: ${app.userId}) scaduta. Pulizia in corso...`);
                
                app.status = 'EXPIRED';
                await app.save();

                if (channel) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle(t('whitelist.session_expired_title', lang))
                        .setDescription(t('whitelist.session_expired_desc', lang));
                    
                    await channel.send({ embeds: [timeoutEmbed] }).catch(() => {});
                    setTimeout(() => channel.delete().catch(() => {}), 10000);
                }
            } else {
                // Sessione ancora valida
                logger.success(`Sessione ${app._id} recuperata. Tempo rimanente: ${Math.round(timeLeft / 60000)} minuti.`);

                // Reimposta il timer di auto-chiusura
                setTimeout(async () => {
                    const checkApp = await WhitelistApp.findOne({ _id: app._id, status: 'PENDING' });
                    if (checkApp) {
                        const lateChannel = guild.channels.cache.get(app.channelId);
                        if (lateChannel) {
                            const timeoutEmbed = new EmbedBuilder()
                                .setColor('#ff4757')
                                .setTitle(t('whitelist.time_expired_title', lang))
                                .setDescription(t('whitelist.time_expired_desc', lang));
                            
                            await lateChannel.send({ embeds: [timeoutEmbed] }).catch(() => {});
                            setTimeout(() => lateChannel.delete().catch(() => {}), 10000);
                        }
                        checkApp.status = 'EXPIRED';
                        await checkApp.save();
                    }
                }, timeLeft);
            }
        }

        logger.info('Recupero sessioni whitelist completato.');
    } catch (error) {
        logger.error('Error recovering whitelist sessions:', error);
    }
}
