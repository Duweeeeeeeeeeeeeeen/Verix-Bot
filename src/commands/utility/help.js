import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Guild from '../../models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Mostra la lista dei comandi e i moduli attivi del bot.'),
    
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        const prefix = guildData?.prefix || '!';

        const helpEmbed = new EmbedBuilder()
            .setTitle('Verix Bot | Centro Supporto')
            .setDescription(`Benvenuto nel centro assistenza di Verix. Il bot utilizza principalmente i **Comandi Slash** (digita \`/\`), ma supporta anche il prefisso personalizzato per questo server: \`${prefix}\`.`)
            .setColor('#3b82f6')
            .addFields(
                { name: '🌐 Dashboard', value: 'Gestisci il bot dal web: [verixbot.com](https://verixbot.com)', inline: true },
                { name: '🆘 Supporto', value: 'Unisciti al nostro [Server Discord](https://discord.gg/Ck3rGpSV7U)', inline: true },
                { name: '📑 Documentazione', value: `[Leggi la guida](https://verixbot.com/config/${interaction.guild.id}/guide)`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { 
                    name: '🛠️ Moduli Attivi', 
                    value: (guildData?.enabledModules || []).map(m => `✅ \`${m.toUpperCase()}\``).join(' ') || 'Nessun modulo attivo.' 
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
