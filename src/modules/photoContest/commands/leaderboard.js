import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import User from '../../../models/User.js';

export default {
    data: new SlashCommandBuilder()
        .setName('photo-leaderboard')
        .setDescription('Mostra i vincitori dei contest fotografici'),
    async execute(interaction) {
        try {
            const topUsers = await User.find({ photoWins: { $gt: 0 } })
                .sort({ photoWins: -1 })
                .limit(10);

            if (topUsers.length === 0) {
                return interaction.reply('😔 Nessun vincitore registrato ancora.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🏆 Leaderboard Photo Contest')
                .setDescription('Gli utenti con più vittorie nel server!')
                .setColor('#FFD700')
                .setThumbnail('https://i.imgur.com/89k5I5L.png'); // Trophy icon

            const list = topUsers.map((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
                return `${medal} **${u.username || `<@${u.discordId}>`}**: ${u.photoWins} vittorie`;
            }).join('\n');

            embed.addFields({ name: 'Top 10 Vincitori', value: list });
            embed.setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await interaction.reply({ content: '❌ Errore durante il recupero della leaderboard.', flags: [MessageFlags.Ephemeral] });
        }
    }
};
