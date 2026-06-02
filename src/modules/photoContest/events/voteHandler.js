import { EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import PhotoSubmission from '../../../models/PhotoSubmission.js';
import PhotoContest from '../../../models/PhotoContest.js';
import PhotoContestConfig from '../../../models/PhotoContestConfig.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isButton() && interaction.customId === 'pc_submit_info') {
            // Check if contest is active
            const activeContest = await PhotoContest.findOne({ guildId: interaction.guildId, status: 'ACTIVE' });
            if (!activeContest) {
                return messageService.reply(interaction, 'photocontest', 'no_contest_active', {}, { ephemeral: true });
            }

            // Check if user already submitted
            const existing = await PhotoSubmission.findOne({ contestId: activeContest._id, userId: interaction.user.id });
            if (existing) {
                return messageService.reply(interaction, 'photocontest', 'already_submitted', {}, { ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId('pc_submit_modal')
                .setTitle('Submit Your Photo');

            const titleInput = new TextInputBuilder()
                .setCustomId('pc_modal_title')
                .setLabel('Photo Title')
                .setPlaceholder('Add a clear title...')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(100);

            const descInput = new TextInputBuilder()
                .setCustomId('pc_modal_desc')
                .setLabel('Description')
                .setPlaceholder('Tell us something about this photo...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setMaxLength(500);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(descInput)
            );

            return await interaction.showModal(modal);
        }

        // Handle Modal Submission
        if (interaction.isModalSubmit() && interaction.customId === 'pc_submit_modal') {
            const title = interaction.fields.getTextInputValue('pc_modal_title');
            const description = interaction.fields.getTextInputValue('pc_modal_desc');

            if (client.photocontestManager) {
                client.photocontestManager.pendingSubmissions.set(interaction.user.id, {
                    title,
                    description,
                    timestamp: Date.now()
                });
            }

            return messageService.reply(interaction, 'photocontest', 'submission_data_saved', {}, { ephemeral: true });
        }

        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('pc_')) return;
        
        // ... (rest of the file starts with pc_leaderboard_view)

        if (interaction.customId === 'pc_leaderboard_view') {
            try {
                const activeContest = await PhotoContest.findOne({ guildId: interaction.guildId, status: 'ACTIVE' });
                const submissions = await PhotoSubmission.find({ contestId: activeContest?._id }).sort({ score: -1 }).limit(10);
                
                if (!submissions || submissions.length === 0) {
                    return messageService.reply(interaction, 'photocontest', 'no_submissions_leaderboard', {}, { ephemeral: true });
                }

                let list = '';
                for (let i = 0; i < submissions.length; i++) {
                    const sub = submissions[i];
                    list += `${i + 1}. <@${sub.userId}> — **${sub.score} pt**\n`;
                }

                const embed = await messageService.get(interaction.guildId, 'photocontest', 'leaderboard_display', {
                    list: list
                });

                return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            } catch (err) {
                return messageService.reply(interaction, 'photocontest', 'leaderboard_error', {}, { ephemeral: true });
            }
        }

        if (!interaction.customId.startsWith('pc_vote_')) return;

        const parts = interaction.customId.split('_');
        const type = parts[2]; // 'up' or 'down'
        const contestId = parts[3];
        const voterId = interaction.user.id;

        try {
            // Find config
            const config = await PhotoContestConfig.findOne({ guildId: interaction.guildId });

            // Fetch submission
            const submission = await PhotoSubmission.findOne({ 
                messageId: interaction.message.id,
                guildId: interaction.guildId
            });

            if (!submission) return messageService.reply(interaction, 'photocontest', 'entry_not_found_error', {}, { ephemeral: true });
            
            // 2. NO SELF-VOTE
            if (submission.userId === voterId) {
                return messageService.reply(interaction, 'photocontest', 'self_vote_error', {}, { ephemeral: true });
            }

            const upIndex = submission.upvotes.indexOf(voterId);
            const downIndex = submission.downvotes.indexOf(voterId);

            let notifyContent = '';

            if (type === 'up') {
                if (upIndex > -1) {
                    // 3. NO UN-VOTE (Voto già presente)
                    return messageService.reply(interaction, 'photocontest', 'already_voted_error', {}, { ephemeral: true });
                } else {
                    submission.upvotes.push(voterId);
                    if (downIndex > -1) submission.downvotes.splice(downIndex, 1);
                    await messageService.reply(interaction, 'photocontest', 'vote_success_up', {}, { ephemeral: true });
                    notifyContent = 'up';
                }
            } else if (type === 'down') {
                if (downIndex > -1) {
                    return messageService.reply(interaction, 'photocontest', 'already_voted_error', {}, { ephemeral: true });
                } else {
                    submission.downvotes.push(voterId);
                    if (upIndex > -1) submission.upvotes.splice(upIndex, 1);
                    await messageService.reply(interaction, 'photocontest', 'vote_success_down', {}, { ephemeral: true });
                    notifyContent = 'down';
                }
            }

            submission.score = submission.upvotes.length - submission.downvotes.length;
            await submission.save();

            // Update Embed with visual score label
            const oldEmbed = interaction.message.embeds[0];
            const oldDesc = oldEmbed.description || '';
            
            let expiryPart = 'N/A';
            if (oldDesc.includes('Scadenza:')) {
                expiryPart = oldDesc.split('Scadenza:')[1].trim();
            } else if (oldDesc.includes('🏁')) {
                expiryPart = oldDesc.split('🏁')[1].trim();
            }

            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setDescription(`This photo was submitted for the contest.\n\n**Score:** \`${submission.score} pt\`\n**Deadline:** ${expiryPart}`);

            await interaction.message.edit({ embeds: [newEmbed] });

            // Send Notification to author
            if (notifyContent && config?.notifications?.mode !== 'NONE') {
                const author = await interaction.guild.members.fetch(submission.userId).catch(() => null);
                if (author) {
                    const notifyEmbed = await messageService.get(interaction.guildId, 'photocontest', 'interaction_notify', {
                        voter: interaction.user.username,
                        action: notifyContent === 'up' ? 'apprezzato' : 'valutato'
                    });
                    if (notifyEmbed) {
                        notifyEmbed.addFields({ name: 'Contest', value: `[Link al Messaggio](${interaction.message.url})` });
                        await author.send({ embeds: [notifyEmbed] }).catch(() => {});
                    }
                }
            }

        } catch (error) {
            logger.error('[PhotoContest] Vote handling error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await messageService.reply(interaction, 'photocontest', 'error', {}, { ephemeral: true });
            }
        }
    }
};
