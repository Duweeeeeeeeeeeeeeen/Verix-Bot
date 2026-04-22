import WhitelistApp from '../../../models/WhitelistApp.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import logger from '../../../utils/logger.js';
import { EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';

/**
 * Recupera e gestisce le sessioni di whitelist attive dopo un riavvio del bot.
 * @param {import('discord.js').Client} client 
 */
export async function recoverWhitelistSessions(client) {
    logger.info('Inizio recupero sessioni whitelist attive...');
    
    if (mongoose.connection.readyState !== 1) {
        logger.warn('Salto recupero sessioni whitelist: Database non connesso.');
        return;
    }

    try {
        const pendingApps = await WhitelistApp.find({ status: 'PENDING' });
        
        if (pendingApps.length === 0) {
            logger.info('Nessuna sessione whitelist in sospeso da recuperare.');
            return;
        }

        logger.info(`Trovate ${pendingApps.length} sessioni da controllare.`);

        for (const app of pendingApps) {
            const config = await WhitelistConfig.findOne({ guildId: app.guildId });
            if (!config) {
                logger.warn(`Configurazione non trovata per il server ${app.guildId}. Salto la sessione.`);
                continue;
            }

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
                        .setTitle('⏳ SESSIONE SCADUTA')
                        .setDescription('Questa sessione è scaduta durante la manutenzione del sistema.\nIl canale verrà rimosso tra breve.');
                    
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
                                .setTitle('⏳ TEMPO SCADUTO')
                                .setDescription('La tua sessione di whitelist è terminata per inattività.\nPotrai riprovare una volta scaduto il cooldown.');
                            
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
        logger.error('Errore durante il recupero delle sessioni whitelist:', error);
    }
}
