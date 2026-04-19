import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import User from '../../models/User.js';
import logger from '../../utils/logger.js';

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
                return interaction.reply({ content: 'Utente non trovato nel database.', flags: [MessageFlags.Ephemeral] });
            }

            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
                .setTitle('💰 Bilancio Utente')
                .addFields(
                    { name: 'Wallet', value: `\`${userData.balance.toLocaleString()} Coins\``, inline: true },
                    { name: 'Level', value: `\`${userData.level}\``, inline: true },
                    { name: 'XP', value: `\`${userData.xp}\``, inline: true }
                )
                .setThumbnail(target.displayAvatarURL())
                .setTimestamp()
                .setFooter({ text: 'Sistema di Economia Professionale' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error('Error in balance command:', error);
            await interaction.reply({ content: 'Si è verificato un errore nel recupero del bilancio.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
