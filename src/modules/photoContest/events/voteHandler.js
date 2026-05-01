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
                return interaction.reply({ content: '❌ Non c\'è alcun contest attivo al momento.', flags: [MessageFlags.Ephemeral] });
            }

            // Check if user already submitted
            const existing = await PhotoSubmission.findOne({ contestId: activeContest._id, userId: interaction.user.id });
            if (existing) {
                return interaction.reply({ content: '❌ Hai già inviato una foto per questo contest!', flags: [MessageFlags.Ephemeral] });
            }

            const modal = new ModalBuilder()
                .setCustomId('pc_submit_modal')
                .setTitle('Invia la tua Foto');

            const titleInput = new TextInputBuilder()
                .setCustomId('pc_modal_title')
                .setLabel('Titolo della Foto')
                .setPlaceholder('Inserisci un titolo accattivante...')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(100);

            const descInput = new TextInputBuilder()
                .setCustomId('pc_modal_desc')
                .setLabel('Descrizione / Storia')
                .setPlaceholder('Raccontaci qualcosa di questa foto...')
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

            return interaction.reply({ 
                content: '✅ **Dati salvati!** Ora invia la tua foto (come allegato) in questo canale entro 5 minuti per completare la sottomissione.', 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('pc_')) return;
        
        // ... (rest of the file starts with pc_leaderboard_view)

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
            // Find config
            const config = await PhotoContestConfig.findOne({ guildId: interaction.guildId });

            // Fetch submission
            const submission = await PhotoSubmission.findOne({ 
                messageId: interaction.message.id,
                guildId: interaction.guildId
            });

            if (!submission) return interaction.reply({ content: '❌ Errore: Foto non trovata nel registro.', flags: [MessageFlags.Ephemeral] });
            
            // 2. NO SELF-VOTE
            if (submission.userId === voterId) {
                return interaction.reply({ content: '❌ Non puoi votare la tua stessa opera!', flags: [MessageFlags.Ephemeral] });
            }

            const upIndex = submission.upvotes.indexOf(voterId);
            const downIndex = submission.downvotes.indexOf(voterId);

            let notifyContent = '';

            if (type === 'up') {
                if (upIndex > -1) {
                    // 3. NO UN-VOTE (Voto già presente)
                    return interaction.reply({ content: '⚠️ Hai già votato positivamente questa foto! Non puoi cambiare o rimuovere il voto.', flags: [MessageFlags.Ephemeral] });
                } else {
                    submission.upvotes.push(voterId);
                    if (downIndex > -1) submission.downvotes.splice(downIndex, 1);
                    await interaction.reply({ content: '✅ Hai votato positivamente questa foto!', flags: [MessageFlags.Ephemeral] });
                    notifyContent = 'up';
                }
            } else if (type === 'down') {
                if (downIndex > -1) {
                    return interaction.reply({ content: '⚠️ Hai già votato negativamente questa foto! Non puoi cambiare o rimuovere il voto.', flags: [MessageFlags.Ephemeral] });
                } else {
                    submission.downvotes.push(voterId);
                    if (upIndex > -1) submission.upvotes.splice(upIndex, 1);
                    await interaction.reply({ content: '✅ Hai votato negativamente questa foto.', flags: [MessageFlags.Ephemeral] });
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
                .setDescription(`Questa fotografia è stata sottomessa per il contest cittadino.\n\n**Punteggio:** \`${submission.score} pt\`\n**Scadenza:** ${expiryPart}`);

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
                await interaction.reply({ content: '❌ Errore durante il voto.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
};
