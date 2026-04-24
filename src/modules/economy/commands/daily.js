import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import User from '../../../models/User.js';
import logger from '../../../utils/logger.js';
import messageService from '../../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Riscatta il tuo premio giornaliero!'),
    async execute(interaction) {
        const dailyAmount = 500;
        const cooldown = 24 * 60 * 60 * 1000;

        try {
            const userData = await User.findOne({ discordId: interaction.user.id });

            if (userData.lastDaily !== null && cooldown - (Date.now() - userData.lastDaily) > 0) {
                const timeLeft = cooldown - (Date.now() - userData.lastDaily);
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                return messageService.reply(interaction, 'economy', 'cooldown', {
                    time: `${hours}h ${minutes}m`
                }, { ephemeral: true });
            }

            userData.balance += dailyAmount;
            userData.lastDaily = Date.now();
            await userData.save();

            await messageService.reply(interaction, 'economy', 'daily', {
                amount: dailyAmount.toString()
            });
        } catch (error) {
            logger.error('Error in daily command:', error);
            await interaction.reply({ content: 'Si è verificato un errore.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
