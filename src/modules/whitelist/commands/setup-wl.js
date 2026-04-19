import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder as ActionRow, ButtonBuilder, ButtonStyle } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-wl')
        .setDescription('Configura il pannello iniziale della whitelist.')
        .addChannelOption(opt => opt.setName('panel_channel').setDescription('Canale dove inviare il pannello').setRequired(true))
        .addChannelOption(opt => opt.setName('log_channel').setDescription('Canale dove lo staff revisionerà le domande').setRequired(true))
        .addRoleOption(opt => opt.setName('staff_role').setDescription('Ruolo dello staff che può revisionare').setRequired(true))
        .addStringOption(opt => opt.setName('primary_color').setDescription('Colore primario (HEX es: #5865F2)').setRequired(false))
        .addStringOption(opt => opt.setName('success_color').setDescription('Colore successo (HEX es: #2ecc71)').setRequired(false))
        .addStringOption(opt => opt.setName('error_color').setDescription('Colore errore (HEX es: #ff4757)').setRequired(false))
        .addStringOption(opt => opt.setName('banner_url').setDescription('URL Immagine Banner principale').setRequired(false))
        .addStringOption(opt => opt.setName('thumb_url').setDescription('URL Thumbnail principale').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const panelChannel = interaction.options.getChannel('panel_channel');
        const logChannel = interaction.options.getChannel('log_channel');
        const staffRole = interaction.options.getRole('staff_role');
        const primary = interaction.options.getString('primary_color');
        const success = interaction.options.getString('success_color');
        const error = interaction.options.getString('error_color');
        const banner = interaction.options.getString('banner_url');
        const thumb = interaction.options.getString('thumb_url');

        // Permissions check
        const me = interaction.guild.members.me;
        if (!panelChannel.permissionsFor(me).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
            return interaction.reply({ 
                content: `❌ Il bot non ha i permessi necessari (Visualizza, Invia Messaggi, Link incorporati) nel canale ${panelChannel}.`, 
                ephemeral: true 
            });
        }

        if (!logChannel.permissionsFor(me).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
            return interaction.reply({ 
                content: `❌ Il bot non ha i permessi necessari nel canale di log ${logChannel}.`, 
                ephemeral: true 
            });
        }

        // Save initial config (channels/roles + colors/media)
        const updateData = { 
            panelChannelId: panelChannel.id,
            logChannelId: logChannel.id,
            staffRoleIds: [staffRole.id]
        };

        if (primary) updateData['colors.primary'] = primary;
        if (success) updateData['colors.success'] = success;
        if (error) updateData['colors.error'] = error;
        
        // Apply media to 'start' and 'panel' embeds by default if provided
        if (banner) {
            updateData['embeds.start.image'] = banner;
            updateData['embeds.question.image'] = banner;
        }
        if (thumb) {
            updateData['embeds.start.thumbnail'] = thumb;
        }

        await WhitelistConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $set: updateData },
            { upsert: true }
        );

        // Show Modal for Appearance
        const modal = new ModalBuilder()
            .setCustomId('wl_setup_modal')
            .setTitle('Estetica Pannello Whitelist');

        const titleInput = new TextInputBuilder()
            .setCustomId('wl_title')
            .setLabel('Titolo dell\'Embed')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('es: Sistema Whitelist RP')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('wl_desc')
            .setLabel('Descrizione dell\'Embed')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Spiega come funziona la whitelist...')
            .setRequired(true);

        const colorInput = new TextInputBuilder()
            .setCustomId('wl_color')
            .setLabel('Colore (HEX)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('#5865F2')
            .setRequired(false);

        modal.addComponents(
            new ActionRow().addComponents(titleInput),
            new ActionRow().addComponents(descInput),
            new ActionRow().addComponents(colorInput)
        );

        await interaction.showModal(modal);
    },
};
