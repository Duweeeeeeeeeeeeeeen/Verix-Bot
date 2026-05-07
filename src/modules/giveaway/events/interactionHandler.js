import Giveaway from '../../../models/Giveaway.js';
import messageService from '../../../utils/messageService.js';
import { MessageFlags } from 'discord.js';

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('gw_join_')) return;

        const giveawayId = interaction.customId.replace('gw_join_', '');
        const voterId = interaction.user.id;

        try {
            const giveaway = await Giveaway.findOne({ messageId: interaction.message.id, status: 'ACTIVE' });
            if (!giveaway) {
                return messageService.reply(interaction, 'giveaway', 'already_ended', {}, { ephemeral: true });
            }

            if (giveaway.participants.includes(voterId)) {
                // Toggle off / Leave
                giveaway.participants = giveaway.participants.filter(p => p !== voterId);
                await giveaway.save();
                
                // Update message
                const embed = interaction.message.embeds[0];
                const newEmbed = {
                    ...embed.data,
                    fields: [
                        { name: '👥 Partecipanti', value: `${giveaway.participants.length}`, inline: true }
                    ]
                };

                await interaction.update({ embeds: [newEmbed] });
                return;
            }

            // Join
            giveaway.participants.push(voterId);
            await giveaway.save();

            const embed = interaction.message.embeds[0];
            const newEmbed = {
                ...embed.data,
                fields: [
                    { name: '👥 Partecipanti', value: `${giveaway.participants.length}`, inline: true }
                ]
            };

            await interaction.update({ embeds: [newEmbed] });
        } catch (error) {
            console.error('[Giveaway] Error joining:', error);
        }
    }
};
