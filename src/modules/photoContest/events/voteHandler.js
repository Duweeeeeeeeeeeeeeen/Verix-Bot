import { EmbedBuilder, MessageFlags } from 'discord.js';
import PhotoSubmission from '../../../models/PhotoSubmission.js';
import PhotoContest from '../../../models/PhotoContest.js';
import PhotoContestConfig from '../../../models/PhotoContestConfig.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('pc_')) return;
        
        if (interaction.customId === 'pc_submit_info') {
            return interaction.reply({ 
                content: '📸 **Come partecipare:** Invia una foto (come allegato) in questo canale per partecipare al contest attuale!\n\n*Nota: Puoi inviare una sola foto per contest.*', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        if (interaction.customId === 'pc_leaderboard_view') {
            try {
                const activeContest = await PhotoContest.findOne({ guildId: interaction.guildId, status: 'ACTIVE' });
                const submissions = await PhotoSubmission.find({ contestId: activeContest?._id }).sort({ score: -1 }).limit(10);
                
                if (!submissions || submissions.length === 0) {
                    return interaction.reply({ content: '📊 Al momento non ci sono foto in classifica.', flags: [MessageFlags.Ephemeral] });
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
                return interaction.reply({ content: '❌ Errore durante il recupero della classifica.', flags: [MessageFlags.Ephemeral] });
            }
        }

        if (!interaction.customId.startsWith('pc_vote_')) return;

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
                const embed = await messageService.get(interaction.guildId, 'photocontest', 'entry_not_found');
                return interaction.reply({ 
                    embeds: [embed], 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            if (submission.userId === voterId) {
                const embed = await messageService.get(interaction.guildId, 'photocontest', 'self_vote_error');
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
                    await messageService.reply(interaction, 'photocontest', 'vote_removed', {});
                } else {
                    submission.upvotes.push(voterId);
                    if (downIndex > -1) submission.downvotes.splice(downIndex, 1);
                    await messageService.reply(interaction, 'photocontest', 'vote_up', {});
                    notifyContent = true;
                }
            } else if (type === 'down') {
                if (downIndex > -1) {
                    submission.downvotes.splice(downIndex, 1);
                    await messageService.reply(interaction, 'photocontest', 'vote_removed', {});
                } else {
                    submission.downvotes.push(voterId);
                    if (upIndex > -1) submission.upvotes.splice(upIndex, 1);
                    await messageService.reply(interaction, 'photocontest', 'vote_down', {});
                }
            }

            submission.score = submission.upvotes.length - submission.downvotes.length;
            await submission.save();

            // Update Embed with visual score label
            const oldEmbed = interaction.message.embeds[0];
            const oldDesc = oldEmbed.description || '';
            
            // Extract expiry time robustly
            let expiryPart = 'N/A';
            if (oldDesc.includes('Scadenza:')) {
                expiryPart = oldDesc.split('Scadenza:')[1].trim();
            } else if (oldDesc.includes('🏁')) {
                expiryPart = oldDesc.split('🏁')[1].trim();
            }

            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setDescription(`Questa fotografia è stata sottomessa per il contest cittadino.\n\n**Punteggio:** \`${submission.score} pt\`\n**Scadenza:** ${expiryPart}`);

            await interaction.message.edit({ embeds: [newEmbed] });

            // Send Notification to author
            if (notifyContent && config?.enableNotifications) {
                const author = await interaction.guild.members.fetch(submission.userId).catch(() => null);
                if (author) {
                    const notifyEmbed = await messageService.get(interaction.guildId, 'photocontest', 'interaction_notify');
                    if (notifyEmbed) {
                        notifyEmbed.addFields({ name: 'Contest', value: `[Link al Messaggio](${interaction.message.url})` });
                        await author.send({ embeds: [notifyEmbed] }).catch(() => {});
                    }
                }
            }

        } catch (error) {
            logger.error('[PhotoContest] Vote handling error:', error);
            if (!interaction.replied) await messageService.reply(interaction, 'photocontest', 'error', { reason: 'Errore durante il voto.' }, { ephemeral: true });
        }
    }
};
