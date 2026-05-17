import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import UserExperience from '../../../models/UserExperience.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import LevelingConfig from '../../../models/LevelingConfig.js';
import messageService from '../../../utils/messageService.js';
import { t } from '../../../locales/t.js';
import logger from '../../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server\'s top active members.')
        .setDescriptionLocalizations({
            it: 'Visualizza la classifica dei membri più attivi del server.'
        }),
    async execute(interaction) {
        const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guildId });
        const lang = globalConfig?.language || 'en';

        try {
            // Check module enablement
            const config = await LevelingConfig.findOne({ guildId: interaction.guildId });
            if (!config || !config.enabled) {
                const disabledEmbed = await messageService.get(interaction.guildId, 'leveling', 'disabled');
                return interaction.reply({ embeds: [disabledEmbed], ephemeral: true });
            }

            const guildId = interaction.guildId;

            // Fetch top 10 users by XP descending
            const topUsers = await UserExperience.find({ guildId })
                .sort({ xp: -1 })
                .limit(10);

            if (topUsers.length === 0) {
                const emptyTitle = t('leveling.leaderboard.empty_title', lang);
                const emptyDesc = t('leveling.leaderboard.empty_desc', lang);
                const emptyEmbed = new EmbedBuilder()
                    .setTitle(emptyTitle)
                    .setDescription(emptyDesc)
                    .setColor('#f1c40f')
                    .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
                return interaction.reply({ embeds: [emptyEmbed] });
            }

            // Emojis for positions
            const getMedal = (index) => {
                switch (index) {
                    case 0: return '🥇';
                    case 1: return '🥈';
                    case 2: return '🥉';
                    default: return `\`#${index + 1}\``;
                }
            };

            // Format entries
            let description = '';
            for (let i = 0; i < topUsers.length; i++) {
                const userExp = topUsers[i];
                const medal = getMedal(i);
                description += `${medal} <@${userExp.userId}> • **Lvl ${userExp.level}** (\`${userExp.xp} XP\`) • Messages: \`${userExp.totalMessages}\`\n`;
            }

            // Calculate current user's rank
            const authorExp = await UserExperience.findOne({ guildId, userId: interaction.user.id });
            let userRankText = t('leveling.leaderboard.unranked', lang);
            if (authorExp) {
                const rank = await UserExperience.countDocuments({
                    guildId,
                    xp: { $gt: authorExp.xp }
                }) + 1;
                userRankText = `#${rank}`;
            }

            const title = t('leveling.leaderboard.title', lang);
            const footerText = t('leveling.leaderboard.footer', lang, { rank: userRankText });

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${title}`)
                .setDescription(description)
                .setColor('#5865F2')
                .setFooter({ text: footerText, iconURL: interaction.guild.iconURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error('Error executing /leaderboard command:', error);
            await messageService.reply(interaction, 'system', 'generic_error', {}, { ephemeral: true });
        }
    }
};
