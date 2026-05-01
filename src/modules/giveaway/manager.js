import Giveaway from '../../models/Giveaway.js';
import logger from '../../utils/logger.js';
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

class GiveawayManager {
    constructor(client) {
        this.client = client;
        this.interval = null;
    }

    async init() {
        logger.info('[Giveaway] Manager initialized.');
        this.startLoop();
    }

    startLoop() {
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.checkGiveaways(), 60000); // Every minute
    }

    async checkGiveaways() {
        try {
            const now = new Date();
            
            // 1. End active giveaways that reached their endTime
            const giveawaysToEnd = await Giveaway.find({ 
                endTime: { $lte: now }, 
                status: 'ACTIVE' 
            });

            for (const giveaway of giveawaysToEnd) {
                await this.endGiveaway(giveaway);
            }

            // 2. Start scheduled giveaways that reached their startTime
            const giveawaysToStart = await Giveaway.find({
                startTime: { $lte: now },
                status: 'SCHEDULED'
            });

            for (const giveaway of giveawaysToStart) {
                await this.startGiveaway(giveaway);
            }
        } catch (error) {
            logger.error('[Giveaway] Error in check loop:', error);
        }
    }

    async startGiveaway(giveaway) {
        try {
            const guild = await this.client.guilds.fetch(giveaway.guildId).catch(() => null);
            if (!guild) return;

            const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null);
            if (!channel) return;

            const title = giveaway.customTitle || `🎉 GIVEAWAY: ${giveaway.prize}`;
            let description = giveaway.customDescription || `Clicca il tasto qui sotto per partecipare!\n\n⌛ **Termina:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`;
            
            // Basic placeholder replacement
            description = description
                .replace(/{prize}/g, giveaway.prize)
                .replace(/{endtime}/g, `<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`);

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .addFields({ name: '👥 Partecipanti', value: '0', inline: true })
                .setColor(giveaway.color || '#5865F2')
                .setTimestamp(giveaway.endTime)
                .setFooter({ text: 'Termina il' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gw_join_${Date.now()}`)
                        .setLabel('Partecipa')
                        .setEmoji('🎉')
                        .setStyle(ButtonStyle.Primary)
                );

            const msg = await channel.send({ embeds: [embed], components: [row] });
            
            giveaway.messageId = msg.id;
            giveaway.status = 'ACTIVE';
            await giveaway.save();

            logger.info(`[Giveaway] Started scheduled giveaway ${giveaway._id} in ${guild.name}`);
        } catch (error) {
            logger.error(`[Giveaway] Error starting scheduled giveaway ${giveaway._id}:`, error);
        }
    }

    async endGiveaway(giveaway) {
        try {
            giveaway.status = 'ENDED';
            await giveaway.save();

            const guild = await this.client.guilds.fetch(giveaway.guildId).catch(() => null);
            if (!guild) return;

            const channel = await guild.channels.fetch(giveaway.channelId).catch(() => null);
            if (!channel) return;

            const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
            
            if (giveaway.participants.length === 0) {
                if (message) {
                    const endedEmbed = EmbedBuilder.from(message.embeds[0])
                        .setDescription('❌ **Giveaway terminato!** Nessun partecipante.')
                        .setColor('#ff4757');
                    await message.edit({ embeds: [endedEmbed], components: [] });
                }
                return channel.send(`❌ Il giveaway per **${giveaway.prize}** è terminato, ma non ci sono stati partecipanti.`);
            }

            // Draw winners
            const participants = [...giveaway.participants];
            const winners = [];
            const count = Math.min(giveaway.winnerCount, participants.length);

            for (let i = 0; i < count; i++) {
                const index = Math.floor(Math.random() * participants.length);
                winners.push(participants.splice(index, 1)[0]);
            }

            giveaway.winners = winners;
            await giveaway.save();

            const winnersMention = winners.map(w => `<@${w}>`).join(', ');

            if (message) {
                const endedEmbed = EmbedBuilder.from(message.embeds[0])
                    .setDescription(`🎉 **Giveaway terminato!**\n\n🏆 Vincitori: ${winnersMention}`)
                    .setColor('#2ed573');
                await message.edit({ embeds: [endedEmbed], components: [] });
            }

            channel.send(`🎉 Congratulazioni ${winnersMention}! Avete vinto: **${giveaway.prize}**!`);
            
            logger.info(`[Giveaway] Ended in ${guild.name}. Winners: ${winners.join(', ')}`);
        } catch (error) {
            logger.error(`[Giveaway] Error ending giveaway ${giveaway._id}:`, error);
        }
    }
}

export default GiveawayManager;
