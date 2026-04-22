import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, MessageFlags } from 'discord.js';
import { getButtonStyle } from '../../../utils/uiBuilder.js';
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
        const btnLabel = interaction.fields.getTextInputValue('wl_btn_label');
        const btnEmoji = interaction.fields.getTextInputValue('wl_btn_emoji');
        
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

            if (btnLabel) config.embeds.panel.button.label = btnLabel;
            if (btnEmoji) config.embeds.panel.button.emoji = btnEmoji;

            await config.save();

            const panelChannel = interaction.guild.channels.cache.get(config.panelChannelId);
            if (!panelChannel) {
                return interaction.reply({ 
                    content: '❌ Errore: Il canale del pannello non è più valido o il bot non ha accesso. Riesegui `/setup-wl`.', 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // Check if bot can send messages in that channel
            if (!panelChannel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
                return interaction.reply({ 
                    content: `❌ Il bot non ha i permessi per inviare messaggi nel canale <#${config.panelChannelId}>.`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            const buttonSettings = config.embeds?.panel?.button || { label: 'Inizia Whitelist', emoji: '📝', style: 'PRIMARY' };
            
            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('start_wl')
                    .setLabel(buttonSettings.label)
                    .setEmoji(buttonSettings.emoji)
                    .setStyle(getButtonStyle(buttonSettings.style))
            );

            // --- ROBUST BULK CLEANUP ---
            try {
                console.log(`[DEBUG_WL_BOT] Purging legacy panels in <#${config.panelChannelId}>...`);
                const messages = await panelChannel.messages.fetch({ limit: 50 });
                const legacy = messages.filter(m => 
                    m.author.id === client.user.id && 
                    m.components.some(row => row.components.some(c => 
                        c.customId === 'start_wl' || m.content.toLowerCase().includes('whitelist')
                    ))
                );
                for (const m of legacy.values()) {
                    await m.delete().catch(() => null);
                }
            } catch (err) {
                logger.warn(`[Whitelist] Bulk cleanup failed: ${err.message}`);
            }

            const sentMessage = await panelChannel.send({ embeds: [embed], components: [button] });
            
            // Store new message ID and current channel for next replacement
            config.panelMessageId = sentMessage.id;
            config.lastPanelMessageId = sentMessage.id;
            config.lastPanelChannelId = config.panelChannelId;
            await config.save();

            await interaction.reply({ content: '✅ Pannello Whitelist configurato e inviato correttamente!', flags: [MessageFlags.Ephemeral] });

        } catch (error) {
            logger.error('Error in WL Modal Submit:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: `❌ Errore durante il salvataggio: ${error.message || 'Errore interno'}`, 
                    flags: [MessageFlags.Ephemeral] 
                });
            }
        }
    },
};
