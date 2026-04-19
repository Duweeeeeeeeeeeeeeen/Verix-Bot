import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import PhotoContestConfig from '../../../models/PhotoContestConfig.js';
import PhotoContest from '../../../models/PhotoContest.js';
import PhotoSubmission from '../../../models/PhotoSubmission.js';
import logger from '../../../utils/logger.js';

export default {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Check if this channel is a contest channel
        const config = await PhotoContestConfig.findOne({ 
            guildId: message.guildId, 
            channelId: message.channelId,
            enabled: true 
        });
        if (!config) return;

        // Check for active contest
        const activeContest = await PhotoContest.findOne({ 
            guildId: message.guildId, 
            status: 'ACTIVE' 
        });
        if (!activeContest) return;

        // Check for image attachment
        const attachment = message.attachments.first();
        const isImage = attachment && attachment.contentType?.startsWith('image/');
        
        if (!isImage) return;

        try {
            const existing = await PhotoSubmission.findOne({ 
                contestId: activeContest._id, 
                userId: message.author.id 
            });

            if (existing) {
                const warn = await message.reply('❌ Hai già inviato una foto per questo tema!');
                setTimeout(() => {
                    warn.delete().catch(() => null);
                    message.delete().catch(() => null);
                }, 5000);
                return;
            }

            // Create submission embed with Live Timer (relative Discord timestamp)
            const submissionEmbed = new EmbedBuilder()
                .setAuthor({ name: `Inviato da ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTitle(`Tema: ${activeContest.theme || 'Libero'}`)
                .setImage(attachment.url)
                .setDescription(`📊 **Punteggio:** \`0 pt\`\n\n🏁 **Scadenza:** <t:${Math.floor(activeContest.endTime.getTime() / 1000)}:R>`)
                .setColor(config.embedSettings.color)
                .setFooter({ text: 'Usa i bottoni qui sotto per votare!' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`photo_vote_up_${activeContest._id}`)
                        .setLabel('👍 Upvote')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`photo_vote_down_${activeContest._id}`)
                        .setLabel('👎 Downvote')
                        .setStyle(ButtonStyle.Danger)
                );

            const botMsg = await message.channel.send({ embeds: [submissionEmbed], components: [row] });

            await PhotoSubmission.create({
                contestId: activeContest._id,
                guildId: message.guildId,
                userId: message.author.id,
                imageUrl: attachment.url,
                messageId: botMsg.id
            });

            await message.delete().catch(() => null);

        } catch (error) {
            logger.error('[PhotoContest] Error handling submission:', error);
        }
    }
};
