import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getButtonStyle } from '../../../utils/uiBuilder.js';
import VerifyConfig from '../../../models/VerifyConfig.js';
import logger from '../../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-verify')
        .setDescription('Configura il sistema di verifica in un canale specifico.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Il canale dove inviare l\'embed di verifica')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Il ruolo da assegnare alla verifica')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('remove_role')
                .setDescription('Il ruolo da rimuovere alla verifica (opzionale)')
                .setRequired(false))
        .addChannelOption(option => 
            option.setName('log_channel')
                .setDescription('Canale per i log di verifica (opzionale)')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('button_label')
                .setDescription('Testo del bottone di verifica')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('button_emoji')
                .setDescription('Emoji del bottone di verifica')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('button_style')
                .setDescription('Colore del bottone')
                .setRequired(false)
                .addChoices(
                    { name: 'Verde (Success)', value: 'SUCCESS' },
                    { name: 'Blu (Primary)', value: 'PRIMARY' },
                    { name: 'Rosso (Danger)', value: 'DANGER' },
                    { name: 'Grigio (Secondary)', value: 'SECONDARY' }
                )),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const removeRole = interaction.options.getRole('remove_role');
        const logChannel = interaction.options.getChannel('log_channel');
        const btnLabel = interaction.options.getString('button_label');
        const btnEmoji = interaction.options.getString('button_emoji');
        const btnStyle = interaction.options.getString('button_style');

        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        const botHighestRole = interaction.guild.members.me.roles.highest;

        // --- HIERARCHY VALIDATION ---
        if (role.position >= botHighestRole.position) {
            return interaction.editReply({
                content: `❌ **Errore Gerarchia:** Non posso assegnare il ruolo **${role.name}**.\n\nIl ruolo selezionato è superiore o uguale al mio ruolo più alto (**${botHighestRole.name}**).\n\n**Soluzione:** Vai nelle impostazioni del server -> Ruoli e trascina il ruolo del bot sopra **${role.name}**.`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (removeRole && removeRole.position >= botHighestRole.position) {
            return interaction.editReply({
                content: `❌ **Errore Gerarchia (Rimozione):** Non posso rimuovere il ruolo **${removeRole.name}**.\n\nIl ruolo è sopra il mio nella gerarchia.`,
                flags: [MessageFlags.Ephemeral]
            });
        }

        try {
            // Update or create config
            const config = await VerifyConfig.findOneAndUpdate(
                { guildId: interaction.guildId },
                { 
                    channelId: channel.id,
                    roleId: role.id,
                    removeRoleId: removeRole?.id || '',
                    logChannelId: logChannel?.id || '',
                    enabled: true
                },
                { upsert: true, new: true }
            );

            // Apply button customizations if provided
            if (btnLabel) config.buttons.verify.label = btnLabel;
            if (btnEmoji) config.buttons.verify.emoji = btnEmoji;
            if (btnStyle) config.buttons.verify.style = btnStyle;
            await config.save();

            // Create the Embed
            const pEmbed = config.embeds?.panel || {};
            const isPlaceholder = (val) => !val || (typeof val === 'string' && (val.trim() === '' || val === 'Senza Titolo' || val === 'Nessun contenuto impostato.'));

            const embed = new EmbedBuilder()
                .setTitle(!isPlaceholder(pEmbed.title) ? pEmbed.title : '🛡️ Protocollo di Identificazione')
                .setDescription(!isPlaceholder(pEmbed.description) ? pEmbed.description : 'Per accedere alla città, devi confermare la tua identità cittadina. Clicca il pulsante qui sotto per procedere.')
                .setColor(pEmbed.color && pEmbed.color !== '#000000' ? pEmbed.color : '#3BA4FF')
                .setTimestamp()
                .setFooter({ text: !isPlaceholder(pEmbed.footer) ? pEmbed.footer : (interaction.guild.name + ' | Verix RP'), iconURL: interaction.guild.iconURL() });
            
            if (pEmbed.thumbnail) embed.setThumbnail(pEmbed.thumbnail);
            if (pEmbed.image) embed.setImage(pEmbed.image);

            // Create the Button
            const bConfig = config.buttons?.verify || {};
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_user')
                        .setLabel(bConfig.label || 'Verificati Ora')
                        .setEmoji(bConfig.emoji || '✅')
                        .setStyle(getButtonStyle(bConfig.style)),
                );

            // --- ROBUST BULK CLEANUP (Verify) ---
            try {
                console.log(`[DEBUG_VERIFY_BOT] Purging legacy panels in <#${channel.id}>...`);
                const messages = await channel.messages.fetch({ limit: 50 });
                const legacy = messages.filter(m => 
                    m.author.id === interaction.client.user.id && 
                    m.components.some(row => row.components.some(c => 
                        c.customId === 'verify_user'
                    ))
                );
                for (const m of legacy.values()) {
                    await m.delete().catch(() => null);
                }
            } catch (err) {
                logger.warn(`[Verify] Bulk cleanup failed: ${err.message}`);
            }

            // Send to channel
            const sentMessage = await channel.send({ embeds: [embed], components: [row] });

            // Store new message ID and its location
            config.panelMessageId = sentMessage.id;
            config.lastPanelMessageId = sentMessage.id;
            config.lastPanelChannelId = config.channelId;
            await config.save();

            await interaction.editReply({ 
                content: `✅ Sistema di verifica configurato con successo in ${channel}!\nMessaggio ID: \`${sentMessage.id}\``,
                flags: [MessageFlags.Ephemeral] 
            });

            logger.info(`[Verify] Setup completed for guild ${interaction.guildId} in channel ${channel.id}`);

        } catch (error) {
            logger.error('[Verify] Setup Error:', error);
            await interaction.editReply({ 
                content: '❌ Si è verificato un errore durante il setup del sistema di verifica.',
                flags: [MessageFlags.Ephemeral] 
            });
        }
    }
};
