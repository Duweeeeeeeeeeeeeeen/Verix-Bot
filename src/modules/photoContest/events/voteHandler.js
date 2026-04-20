import { EmbedBuilder, MessageFlags } from 'discord.js';
import PhotoSubmission from '../../../models/PhotoSubmission.js';
import PhotoContestConfig from '../../../models/PhotoContestConfig.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('photo_vote_')) return;

        const parts = interaction.customId.split('_');
        const type = parts[2]; // 'up' or 'down'
        const contestId = parts[3];
        const voterId = interaction.user.id;

        try {
            // Find config for notification settings
            const config = await PhotoContestConfig.findOne({ guildId: interaction.guildId });

            // Fetch submission
            const submission = await PhotoSubmission.findOne({ 
                messageId: interaction.message.id,
                contestId: contestId
            });

            if (!submission) {
                const embed = await messageService.get(interaction.guildId, 'photoContest', 'entry_not_found');
                return interaction.reply({ 
                    embeds: [embed], 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            if (submission.userId === voterId) {
                const embed = await messageService.get(interaction.guildId, 'photoContest', 'self_vote_error');
                return interaction.reply({ 
                    embeds: [embed], 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // Anti-cheat / Rule check: 1 vote per user per submission handled by logical check
            const upIndex = submission.upvotes.indexOf(voterId);
            const downIndex = submission.downvotes.indexOf(voterId);

            let notifyContent = null;

            if (type === 'up') {
                if (upIndex > -1) {
                    submission.upvotes.splice(upIndex, 1);
                    await interaction.reply({ content: '👍 Voto rimosso.', flags: [MessageFlags.Ephemeral] });
                } else {
                    submission.upvotes.push(voterId);
                    if (downIndex > -1) submission.downvotes.splice(downIndex, 1);
                    await interaction.reply({ content: '👍 Hai votato positivamente!', flags: [MessageFlags.Ephemeral] });
                    notifyContent = `🌟 Qualcuno ha appena messo un **Upvote** alla tua foto nel contest!`;
                }
            } else if (type === 'down') {
                if (downIndex > -1) {
                    submission.downvotes.splice(downIndex, 1);
                    await interaction.reply({ content: '👎 Voto rimosso.', flags: [MessageFlags.Ephemeral] });
                } else {
                    submission.downvotes.push(voterId);
                    if (upIndex > -1) submission.upvotes.splice(upIndex, 1);
                    await interaction.reply({ content: '👎 Hai votato negativamente.', flags: [MessageFlags.Ephemeral] });
                }
            }

            submission.score = submission.upvotes.length - submission.downvotes.length;
            await submission.save();

            // Update Embed with visual score label
            const oldEmbed = interaction.message.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setDescription(`📊 **Punteggio:** \`${submission.score} pt\`\n\n🏁 **Scadenza:** ${oldEmbed.description.split('🏁 **Scadenza:** ')[1]}`);

            await interaction.message.edit({ embeds: [newEmbed] });

            // Send Notification to author
            if (notifyContent && config?.enableNotifications) {
                const author = await interaction.guild.members.fetch(submission.userId).catch(() => null);
                if (author) {
                    const notifyEmbed = new EmbedBuilder()
                        .setTitle('📸 Nuova Interazione!')
                        .setDescription(notifyContent)
                        .addFields({ name: 'Contest', value: `[Link al Messaggio](${interaction.message.url})` })
                        .setColor('#00FF7F')
                        .setTimestamp();
                    
                    await author.send({ embeds: [notifyEmbed] }).catch(() => {
                        logger.warn(`Could not send DM to ${submission.userId}`);
                    });
                }
            }

        } catch (error) {
            logger.error('[PhotoContest] Vote handling error:', error);
            if (!interaction.replied) await interaction.reply({ content: '❌ Errore durante il voto.', flags: [MessageFlags.Ephemeral] });
        }
    }
};
