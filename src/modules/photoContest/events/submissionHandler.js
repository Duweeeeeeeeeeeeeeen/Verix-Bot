import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import PhotoContestConfig from '../../../models/PhotoContestConfig.js';
import PhotoContest from '../../../models/PhotoContest.js';
import PhotoSubmission from '../../../models/PhotoSubmission.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

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
                const embed = await messageService.get(message.guild.id, 'photocontest', 'already_submitted');
                const warn = await message.reply({ embeds: [embed] });
                setTimeout(() => {
                    warn.delete().catch(() => null);
                    message.delete().catch(() => null);
                }, 5000);
                return;
            }

            const imgName = attachment.name || 'photo.png';
            const file = new AttachmentBuilder(attachment.url, { name: imgName });

            const submissionEmbed = await messageService.get(message.guild.id, 'photocontest', 'submission', {
                username: message.author.username,
                theme: activeContest.theme || 'Libero',
                endTime: `<t:${Math.floor(activeContest.endTime.getTime() / 1000)}:R>`
            });

            submissionEmbed.setImage(`attachment://${imgName}`);
            submissionEmbed.setAuthor({ name: `Inviato da ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

            if (message.content && message.content.trim().length > 0) {
                submissionEmbed.addFields({ name: '📝 Descrizione', value: message.content.trim().substring(0, 1024) });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`photo_vote_up_${activeContest._id}`)
                        .setLabel(config.voteLabel || 'Vota')
                        .setEmoji(config.voteEmoji || '👍')
                        .setStyle(ButtonStyle.Success)
                );

            const botMsg = await message.channel.send({ embeds: [submissionEmbed], components: [row], files: [file] });
            const botAttachment = botMsg.embeds[0]?.image?.url || botMsg.attachments.first()?.url || attachment.url;

            await PhotoSubmission.create({
                contestId: activeContest._id,
                guildId: message.guildId,
                userId: message.author.id,
                imageUrl: botAttachment,
                messageId: botMsg.id
            });

            await message.delete().catch(() => null);

        } catch (error) {
            logger.error('[PhotoContest] Error handling submission:', error);
        }
    }
};
