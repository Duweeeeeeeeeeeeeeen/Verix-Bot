import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import Giveaway from '../../../models/Giveaway.js';
import ms from 'ms';

export default {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Gestione Giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub.setName('start')
               .setDescription('Inizia un nuovo giveaway')
               .addStringOption(opt => opt.setName('premio').setDescription('Cosa si vince?').setRequired(true))
               .addStringOption(opt => opt.setName('durata').setDescription('Esempio: 1h, 1d, 30m').setRequired(true))
               .addIntegerOption(opt => opt.setName('vincitori').setDescription('Numero di vincitori').setRequired(false))
               .addIntegerOption(opt => opt.setName('livello_minimo').setDescription('Livello minimo richiesto').setRequired(false))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'start') {
            const prize = interaction.options.getString('premio');
            const durationStr = interaction.options.getString('durata');
            const winnerCount = interaction.options.getInteger('vincitori') || 1;
            const minLevel = interaction.options.getInteger('livello_minimo') || 0;

            const durationMs = ms(durationStr);
            if (!durationMs) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('Configuration Error')
                    .setDescription('Formato durata non valido (usa es: `1h`, `30m`, `1d`).')
                    .setColor('#ff4757');
                return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            }

            const endTime = new Date(Date.now() + durationMs);

            const embed = new EmbedBuilder()
                .setTitle(`🎉 GIVEAWAY: ${prize}`)
                .setDescription(`Clicca il tasto qui sotto per partecipare!\n\n${minLevel > 0 ? `🛡️ **Livello Minimo Richiesto:** \`${minLevel}\`\n\n` : ''}⌛ **Termina:** <t:${Math.floor(endTime.getTime() / 1000)}:R>`)
                .addFields({ name: '👥 Partecipanti', value: '0', inline: true })
                .setColor('#5865F2')
                .setTimestamp(endTime)
                .setFooter({ text: 'Termina il' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gw_join_${Date.now()}`)
                        .setLabel('Partecipa')
                        .setEmoji('🎉')
                        .setStyle(ButtonStyle.Primary)
                );

            const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            await Giveaway.create({
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                messageId: msg.id,
                prize,
                winnerCount,
                minLevel,
                endTime,
                hostId: interaction.user.id
            });
        }
    }
};
