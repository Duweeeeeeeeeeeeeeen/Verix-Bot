import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import User from '../../../models/User.js';
import messageService from '../../../utils/messageService.js';

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
                return messageService.reply(interaction, 'photocontest', 'no_winners');
            }

            const list = topUsers.map((u, i) => {
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤';
                return `${medal} **${u.username || `<@${u.discordId}>`}**: ${u.photoWins} vittorie`;
            }).join('\n');

            return messageService.reply(interaction, 'photocontest', 'leaderboard', { list });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            await messageService.reply(interaction, 'photocontest', 'error', {}, { ephemeral: true });
        }
    }
};
