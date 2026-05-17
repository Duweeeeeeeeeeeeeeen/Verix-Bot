import { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import PhotoContestConfig from '../../../models/PhotoContestConfig.js';
import PhotoContest from '../../../models/PhotoContest.js';
import PhotoSubmission from '../../../models/PhotoSubmission.js';
import LevelingConfig from '../../../models/LevelingConfig.js';
import { addXp } from '../../../handlers/levelingHandler.js';
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
        if (!config) {
            logger.debug(`[PhotoContest] Message in ${message.channelId} skipped: No matching config found.`);
            return;
        }

        // Check for active contest
        const activeContest = await PhotoContest.findOne({ 
            guildId: message.guildId, 
            status: 'ACTIVE' 
        });
        if (!activeContest) {
            logger.debug(`[PhotoContest] Message in ${message.channelId} skipped: No active contest.`);
            return;
        }

        // Check for image attachment
        const attachment = message.attachments.first();
        const isImage = attachment && attachment.contentType?.startsWith('image/');
        
        if (!isImage) {
            logger.debug(`[PhotoContest] Message in ${message.channelId} skipped: Not an image.`);
            return;
        }

        logger.info(`[PhotoContest] Processing submission from ${message.author.tag} in ${message.channel.name}`);


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

            const imgName = 'submission.png';
            const file = new AttachmentBuilder(attachment.url, { name: imgName });

            const submissionEmbed = await messageService.get(message.guild.id, 'photocontest', 'submission', {
                username: message.author.username,
                theme: activeContest.theme || 'Libero',
                endTime: `<t:${Math.floor(activeContest.endTime.getTime() / 1000)}:R>`
            });

            submissionEmbed.setAuthor({ name: `Inviato da ${message.author.username}`, iconURL: message.author.displayAvatarURL() });

            // Check for Modal data
            const pending = message.client.photocontestManager?.pendingSubmissions.get(message.author.id);
            let dbTitle = '';
            let dbDesc = '';

            if (pending && (Date.now() - pending.timestamp < 300000)) { // 5 mins validity
                dbTitle = pending.title || '';
                dbDesc = pending.description || '';
                message.client.photocontestManager.pendingSubmissions.delete(message.author.id);
            } else {
                dbDesc = message.content.trim();
            }

            // Format for Embed
            const titlePart = dbTitle ? `**Titolo:** ${dbTitle}\n` : '';
            const descPart = dbDesc ? `**Descrizione:** ${dbDesc}` : '';
            const embedDesc = `${titlePart}${descPart}`;

            if (embedDesc) {
                submissionEmbed.setDescription(embedDesc.substring(0, 2048));
            }

            // Set the image AT THE END
            submissionEmbed.setImage(`attachment://${imgName}`);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`pc_vote_up_${activeContest._id}`)
                        .setEmoji(config.upvoteEmoji || '👍')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`pc_vote_down_${activeContest._id}`)
                        .setEmoji(config.downvoteEmoji || '👎')
                        .setStyle(ButtonStyle.Secondary)
                );

            const botMsg = await message.channel.send({ embeds: [submissionEmbed], components: [row], files: [file] });
            const botAttachment = botMsg.embeds[0]?.image?.url || botMsg.attachments.first()?.url || attachment.url;

            await PhotoSubmission.create({
                contestId: activeContest._id,
                guildId: message.guildId,
                userId: message.author.id,
                imageUrl: botAttachment,
                title: dbTitle,
                description: dbDesc,
                messageId: botMsg.id
            });

            await message.delete().catch(() => null);

            // Reward Submission XP
            const levelingConfig = await LevelingConfig.findOne({ guildId: message.guildId });
            if (levelingConfig && levelingConfig.enabled && levelingConfig.photoContestEntryXp > 0) {
                await addXp(message.guild, message.member, levelingConfig.photoContestEntryXp, 'photo_contest_submission', message.channel);
            }

        } catch (error) {
            logger.error('[PhotoContest] Error handling submission:', error);
        }
    }
};
