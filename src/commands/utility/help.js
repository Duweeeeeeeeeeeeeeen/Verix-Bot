import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Guild from '../../models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show the command list and active bot modules.'),
    
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const prefix = guildData?.prefix || '!';

        const helpEmbed = new EmbedBuilder()
            .setTitle('Verix Bot | Help Center')
            .setDescription(`Welcome to the Verix help center. The bot mainly uses **slash commands** (type \`/\`), but it also supports the custom prefix for this server: \`${prefix}\`.`)
            .setColor('#3b82f6')
            .addFields(
                { name: 'Dashboard', value: 'Manage the bot from the web: [verixbot.com](https://verixbot.com)', inline: true },
                { name: 'Support', value: 'Join our [Discord Server](https://discord.gg/Ck3rGpSV7U)', inline: true },
                { name: 'Documentation', value: `[Read the guide](https://verixbot.com/config/${interaction.guild.id}/guide)`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { 
                    name: 'Active Modules', 
                    value: (guildData?.enabledModules || []).map(m => `✅ \`${m.toUpperCase()}\``).join(' ') || 'No active modules.' 
                }
            )
            .setFooter({ text: 'Verix Premium • V2 Edition', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();
 
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Dashboard')
                    .setURL('https://verixbot.com')
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Supporto')
                    .setURL('https://discord.gg/Ck3rGpSV7U')
                    .setStyle(ButtonStyle.Link)
            );

        await interaction.reply({ embeds: [helpEmbed], components: [row] });
    },
};
