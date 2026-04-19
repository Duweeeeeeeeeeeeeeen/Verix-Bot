import { ActionRowBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import TicketConfig from '../../../models/TicketConfig.js';
import logger from '../../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-tickets')
        .setDescription('⚙️ Configura il sistema ticket avanzato.')
        .addChannelOption(opt => opt.setName('panel_channel').setDescription('Canale dove inviare il pannello di creazione').setRequired(true))
        .addChannelOption(opt => opt.setName('category_open').setDescription('Categoria dove verranno aperti i ticket').setRequired(true))
        .addRoleOption(opt => opt.setName('staff_role').setDescription('Ruolo dello staff per il supporto').setRequired(true))
        .addChannelOption(opt => opt.setName('log_channel').setDescription('Canale per le trascrizioni dei ticket chiusi').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const panelChannel = interaction.options.getChannel('panel_channel');
        const categoryOpen = interaction.options.getChannel('category_open');
        const staffRole = interaction.options.getRole('staff_role');
        const logChannel = interaction.options.getChannel('log_channel');

        if (categoryOpen.type !== 4) return interaction.reply({ content: '❌ Seleziona una **categoria**.', flags: [MessageFlags.Ephemeral] });

        try {
            const config = await TicketConfig.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {
                    panelChannelId: panelChannel.id,
                    categoryOpenId: categoryOpen.id,
                    staffRoleIds: [staffRole.id],
                    logChannelId: logChannel.id
                },
                { upsert: true, new: true }
            );

            // Dynamic Options from Config
            const options = Array.from(config.typesConfig.entries()).map(([id, data]) => ({
                label: id.charAt(0).toUpperCase() + id.slice(1),
                value: id,
                emoji: data.emoji || '🎫',
                description: `Apri un ticket per ${id}`
            }));

            // Fallback if no types
            if (options.length === 0) {
                options.push({ label: 'Supporto', value: 'supporto', emoji: '🆘', description: 'Assistenza generica' });
            }

            const pEmbed = config.embeds?.panel || {};
            const embed = new EmbedBuilder()
                .setTitle(pEmbed.title || '🎫 Centro Assistenza & Segnalazioni')
                .setDescription(
                    pEmbed.description || 
                    'Benvenuto nell\'hub di supporto professionale.\n\n' +
                    'Seleziona la categoria di assistenza richiesta dal menu qui sotto.\n' +
                    'Il nostro team prenderà in carico la tua richiesta nel minor tempo possibile.'
                )
                .setColor(pEmbed.color || '#5865F2')
                .setFooter({ text: pEmbed.footer || 'Sistema Ticket Avanzato • Productivity Suite' })
                .setTimestamp();

            if (pEmbed.thumbnail) embed.setThumbnail(pEmbed.thumbnail);
            if (pEmbed.image || config.panelImage) embed.setImage(pEmbed.image || config.panelImage);

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_create_select')
                    .setPlaceholder('Seleziona il tipo di ticket...')
                    .addOptions(options.slice(0, 25)) // Discord limit
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
                    logger.warn(`[Tickets] Could not delete old panel for guild ${interaction.guildId}`);
                }
            }

            const sentMessage = await panelChannel.send({ embeds: [embed], components: [menu] });

            // Store new message ID
            config.panelMessageId = sentMessage.id;
            await config.save();

            await interaction.reply({ 
                content: `✅ **Pannello inviato con successo!**\n- Tipi attivi: \`${options.map(o => o.label).join(', ')}\``, 
                flags: [MessageFlags.Ephemeral] 
            });

        } catch (error) {
            logger.error('Error during ticket setup:', error);
            await interaction.reply({ content: '❌ Errore durante la configurazione.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
