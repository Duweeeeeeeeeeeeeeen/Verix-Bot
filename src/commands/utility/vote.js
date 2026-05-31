import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../../../config/config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Get the Top.gg voting link for Verix.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Vote for Verix on Top.gg')
            .setDescription('If Verix helps your community, you can support the project with a Top.gg vote. It helps new servers discover the bot.')
            .setColor(config.colors.primary)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'Thank you for supporting Verix', iconURL: interaction.client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Vote on Top.gg')
                .setURL(config.topggVoteUrl)
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
