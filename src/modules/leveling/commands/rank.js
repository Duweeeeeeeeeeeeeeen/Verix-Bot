import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import UserExperience from '../../../models/UserExperience.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import LevelingConfig from '../../../models/LevelingConfig.js';
import messageService from '../../../utils/messageService.js';
import { t } from '../../../locales/t.js';
import { getXpForLevel, getCumulativeXpForLevel } from '../../../handlers/levelingHandler.js';
import logger from '../../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your level and experience progression.')
        .setDescriptionLocalizations({
            it: 'Controlla il tuo livello e l\'avanzamento dell\'esperienza.'
        })
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check the rank for')
                .setDescriptionLocalizations({
                    it: 'L\'utente di cui controllare il livello'
                })
        ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
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
            const userId = targetUser.id;

            // Fetch user experience stats
            let userExp = await UserExperience.findOne({ guildId, userId });
            const hasExpRecord = !!userExp;
            
            let dailyXpEarned = 0;
            if (userExp) {
                // Daily Reset Check: Reset daily XP if the UTC calendar date has changed
                const now = new Date();
                const lastReset = userExp.lastXpReset || new Date();
                const isNewDay = now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
                                  now.getUTCMonth() !== lastReset.getUTCMonth() ||
                                  now.getUTCDate() !== lastReset.getUTCDate();

                if (isNewDay) {
                    userExp.dailyXpEarned = 0;
                    userExp.lastXpReset = now;
                    await userExp.save().catch(() => {});
                }
                dailyXpEarned = userExp.dailyXpEarned || 0;
            } else {
                userExp = {
                    xp: 0,
                    level: 0,
                    totalMessages: 0,
                    dailyXpEarned: 0
                };
            }

            const level = userExp.level;
            const xp = userExp.xp;
            const totalMessages = userExp.totalMessages;

            // Mathematical Calculations for Progression
            const currentLevelMinXp = getCumulativeXpForLevel(level);
            const currentLevelXp = xp - currentLevelMinXp;
            const nextLevelXpRequirement = getXpForLevel(level);
            const progressPercent = Math.min(100, Math.floor((currentLevelXp / nextLevelXpRequirement) * 100));

            // Generate Unicode Block Progress Bar
            const barLength = 15;
            const filledLength = Math.round((progressPercent / 100) * barLength);
            const emptyLength = Math.max(0, barLength - filledLength);
            const progressBar = '▰'.repeat(filledLength) + '▱'.repeat(emptyLength);

            // Fetch Global Rank
            let rank = 'N/A';
            if (hasExpRecord) {
                rank = await UserExperience.countDocuments({
                    guildId,
                    xp: { $gt: xp }
                }) + 1;
            }

            // Translations
            const title = t('leveling.rank.title', lang, { username: targetUser.username });
            const levelLabel = t('leveling.rank.level', lang);
            const rankLabel = t('leveling.rank.rank', lang);
            const xpLabel = t('leveling.rank.xp', lang);
            const progressLabel = t('leveling.rank.progress', lang);
            const messagesLabel = t('leveling.rank.messages', lang);
            const dailyLimitLabel = t('leveling.rank.daily_limit', lang);

            const fields = [
                { name: `👤 ${targetUser.username}`, value: `ID: \`${targetUser.id}\``, inline: false },
                { name: `${levelLabel}`, value: `\`${level}\``, inline: true },
                { name: `${rankLabel}`, value: `\`#${rank}\``, inline: true },
                { name: `${messagesLabel}`, value: `\`${totalMessages}\``, inline: true },
                { name: `${xpLabel}`, value: `\`${currentLevelXp} / ${nextLevelXpRequirement} XP\` (Total: \`${xp} XP\`)`, inline: false },
                { name: `${progressLabel}`, value: `\`${progressBar}\` (${progressPercent}%)`, inline: false }
            ];

            if (config.dailyXpCap > 0) {
                fields.push({
                    name: `${dailyLimitLabel}`,
                    value: `\`${Math.min(config.dailyXpCap, dailyXpEarned)} / ${config.dailyXpCap} XP\``,
                    inline: false
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(fields)
                .setColor('#5865F2')
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            logger.error('Error executing /rank command:', error);
            await messageService.reply(interaction, 'system', 'generic_error', {}, { ephemeral: true });
        }
    }
};
