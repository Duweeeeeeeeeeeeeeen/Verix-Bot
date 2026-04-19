import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Riscatta il tuo premio giornaliero!'),
    async execute(interaction) {
        const dailyAmount = 500;
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours in ms

        try {
            const userData = await User.findOne({ discordId: interaction.user.id });

            if (userData.lastDaily !== null && cooldown - (Date.now() - userData.lastDaily) > 0) {
                const timeLeft = cooldown - (Date.now() - userData.lastDaily);
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                return interaction.reply({ 
                    content: `Hai già riscattato il premio oggi! Riprova tra ${hours} ore e ${minutes} minuti.`, 
                    ephemeral: true 
                });
            }

            userData.balance += dailyAmount;
            userData.lastDaily = Date.now();
            await userData.save();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎁 Premio Giornaliero Riscattato!')
                .setDescription(`Hai ricevuto **${dailyAmount} Coins**!`)
                .addFields({ name: 'Nuovo Saldo', value: `\`${userData.balance.toLocaleString()} Coins\`` })
                .setTimestamp()
                .setFooter({ text: 'Torna domani per un altro premio!' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error('Error in daily command:', error);
            await interaction.reply({ content: 'Si è verificato un errore nel riscattare il premio.', ephemeral: true });
        }
    },
};
