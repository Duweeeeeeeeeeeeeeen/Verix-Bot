import { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== 'wl_setup_modal') return;

        const title = interaction.fields.getTextInputValue('wl_title');
        const description = interaction.fields.getTextInputValue('wl_desc');
        let colorInput = interaction.fields.getTextInputValue('wl_color');
        
        // Validate HEX color
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        let color = hexRegex.test(colorInput) ? colorInput : '#5865F2';

        try {
            // Find the config first to ensure it exists
            let config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            
            if (!config) {
                // If somehow it doesn't exist, we create it (fallback)
                config = new WhitelistConfig({ guildId: interaction.guild.id });
            }

            config.title = title;
            config.description = description;
            config.color = color;
            await config.save();

            const panelChannel = interaction.guild.channels.cache.get(config.panelChannelId);
            if (!panelChannel) {
                return interaction.reply({ 
                    content: '❌ Errore: Il canale del pannello non è più valido o il bot non ha accesso. Riesegui `/setup-wl`.', 
                    ephemeral: true 
                });
            }

            // Check if bot can send messages in that channel
            if (!panelChannel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
                return interaction.reply({ 
                    content: `❌ Il bot non ha i permessi per inviare messaggi nel canale <#${config.panelChannelId}>.`, 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_wl')
                    .setLabel('Inizia Whitelist')
                    .setEmoji('📝')
                    .setStyle(ButtonStyle.Primary)
            );

            // --- AUTO-CLEANUP OLD PANEL ---
            if (config.panelMessageId && config.panelChannelId) {
                try {
                    const oldChannel = await interaction.guild.channels.fetch(config.panelChannelId).catch(() => null);
                    if (oldChannel) {
                        const oldMsg = await oldChannel.messages.fetch(config.panelMessageId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => null);
                    }
                } catch (err) {
                    logger.warn(`[Whitelist] Could not delete old panel for guild ${interaction.guildId}`);
                }
            }

            const sentMessage = await panelChannel.send({ embeds: [embed], components: [button] });

            // Store new message ID
            config.panelMessageId = sentMessage.id;
            await config.save();

            await interaction.reply({ content: '✅ Pannello Whitelist configurato e inviato correttamente!', ephemeral: true });

        } catch (error) {
            logger.error('Error in WL Modal Submit:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: `❌ Errore durante il salvataggio: ${error.message || 'Errore interno'}`, 
                    ephemeral: true 
                });
            }
        }
    },
};
