import { SlashCommandBuilder } from 'discord.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';
import messageService from '../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Controlla il tuo bilancio o quello di un altro utente.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('L\'utente di cui vuoi vedere il bilancio')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        
        try {
            const userData = await User.findOne({ discordId: target.id });
            
            if (!userData) {
                return messageService.reply(interaction, 'economy', 'user_not_found', {}, { ephemeral: true });
            }

            await messageService.reply(interaction, 'economy', 'balance', { 
                user: target,
                cash: userData.balance.toLocaleString(),
                bank: '0', // If bank is not in model yet
                level: userData.level,
                xp: userData.xp
            });
        } catch (error) {
            logger.error('Error in balance command:', error);
            await messageService.reply(interaction, 'economy', 'generic_error', {}, { ephemeral: true });
        }
    },
};
