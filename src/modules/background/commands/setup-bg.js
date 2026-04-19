import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import Guild from '../../../models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-bg')
        .setDescription('Configura il sistema di invio Background.')
        .addChannelOption(opt => opt.setName('log_channel').setDescription('Canale dove lo staff riceverà i background').setRequired(true))
        .addChannelOption(opt => opt.setName('panel_channel').setDescription('Canale dove inviare il pannello per gli utenti').setRequired(true))
        .addStringOption(opt => opt.setName('primary_color').setDescription('Colore primario (HEX es: #5865F2)').setRequired(false))
        .addStringOption(opt => opt.setName('success_color').setDescription('Colore successo (HEX es: #2ecc71)').setRequired(false))
        .addStringOption(opt => opt.setName('error_color').setDescription('Colore errore (HEX es: #ff4757)').setRequired(false))
        .addStringOption(opt => opt.setName('banner_url').setDescription('URL Immagine Banner principale').setRequired(false))
        .addStringOption(opt => opt.setName('thumb_url').setDescription('URL Thumbnail principale').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Module enablement check
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData || !guildData.enabledModules.includes('background')) {
            return interaction.reply({ content: '❌ Il modulo Background non è attivo su questo server. Attivalo con `/modules enable background`.', ephemeral: true });
        }

        const logChannel = interaction.options.getChannel('log_channel');
        const panelChannel = interaction.options.getChannel('panel_channel');
        const primary = interaction.options.getString('primary_color');
        const success = interaction.options.getString('success_color');
        const error = interaction.options.getString('error_color');
        const banner = interaction.options.getString('banner_url');
        const thumb = interaction.options.getString('thumb_url');

        try {
            let config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                config = new BackgroundConfig({ guildId: interaction.guild.id });
            }

            config.logChannelId = logChannel.id;
            config.panelChannelId = panelChannel.id;

            if (primary) config.colors.primary = primary;
            if (success) config.colors.success = success;
            if (error) config.colors.error = error;

            if (banner) {
                config.embeds.panel.image = banner;
                config.embeds.instructions.image = banner;
            }
            if (thumb) {
                config.embeds.panel.thumbnail = thumb;
            }

            await config.save();

            const embed = buildEmbed(config.embeds.panel, {
                guild: interaction.guild.name
            }, config);

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_bg')
                    .setLabel('Invia Background')
                    .setEmoji('📖')
                    .setStyle(ButtonStyle.Primary)
            );

            // --- AUTO-CLEANUP OLD PANEL ---
            if (config.panelMessageId && config.panelChannelId) {
                try {
                    const oldChannel = interaction.guild.channels.cache.get(config.panelChannelId);
                    if (oldChannel) {
                        const oldMsg = await oldChannel.messages.fetch(config.panelMessageId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => null);
                    }
                } catch (err) {
                    console.warn(`[Background] Could not delete old panel for guild ${interaction.guildId}`);
                }
            }

            const sentMessage = await panelChannel.send({ embeds: [embed], components: [button] });

            // Store new message ID
            config.panelMessageId = sentMessage.id;
            await config.save();

            await interaction.reply({ content: `✅ Sistema Background configurato!\n- Logs: ${logChannel}\n- Pannello: ${panelChannel}`, ephemeral: true });

        } catch (error) {
            console.error('Error in setup-bg:', error);
            await interaction.reply({ content: 'Si è verificato un errore durante la configurazione.', ephemeral: true });
        }
    },
};
