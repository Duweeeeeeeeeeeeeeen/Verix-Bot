import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
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

            const imgName = attachment.name || 'photo.png';
            const file = new AttachmentBuilder(attachment.url, { name: imgName });

            const submissionEmbed = new EmbedBuilder()
                .setAuthor({ name: `Inviato da ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTitle(`Tema: ${activeContest.theme || 'Libero'}`)
                .setImage(`attachment://${imgName}`)
                .setDescription(`📊 **Punteggio:** \`0 pt\`\n\n🏁 **Scadenza:** <t:${Math.floor(activeContest.endTime.getTime() / 1000)}:R>`)
                .setColor(config.embedSettings.color)
                .setFooter({ text: 'Usa i bottoni qui sotto per votare!' })
                .setTimestamp();

            if (message.content && message.content.trim().length > 0) {
                submissionEmbed.addFields({ name: '📝 Descrizione', value: message.content.trim().substring(0, 1024) });
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`photo_vote_up_${activeContest._id}`)
                        .setEmoji('👍')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`photo_vote_down_${activeContest._id}`)
                        .setEmoji('👎')
                        .setStyle(ButtonStyle.Danger)
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
