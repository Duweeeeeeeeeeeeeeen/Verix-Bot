import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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
                .setRequired(false)),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const removeRole = interaction.options.getRole('remove_role');
        const logChannel = interaction.options.getChannel('log_channel');

        await interaction.deferReply({ ephemeral: true });
        const botHighestRole = interaction.guild.members.me.roles.highest;

        // --- HIERARCHY VALIDATION ---
        if (role.position >= botHighestRole.position) {
            return interaction.editReply({
                content: `❌ **Errore Gerarchia:** Non posso assegnare il ruolo **${role.name}**.\n\nIl ruolo selezionato è superiore o uguale al mio ruolo più alto (**${botHighestRole.name}**).\n\n**Soluzione:** Vai nelle impostazioni del server -> Ruoli e trascina il ruolo del bot sopra **${role.name}**.`,
                ephemeral: true
            });
        }

        if (removeRole && removeRole.position >= botHighestRole.position) {
            return interaction.editReply({
                content: `❌ **Errore Gerarchia (Rimozione):** Non posso rimuovere il ruolo **${removeRole.name}**.\n\nIl ruolo è sopra il mio nella gerarchia.`,
                ephemeral: true
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

            // Create the Embed
            const embed = new EmbedBuilder()
                .setTitle(config.embed.title)
                .setDescription(config.embed.description)
                .setColor(config.embed.color)
                .setTimestamp()
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });

            // Create the Button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_user')
                        .setLabel('Verificati Ora')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success),
                );

            // --- AUTO-CLEANUP OLD PANEL ---
            if (config.panelMessageId && config.channelId) {
                try {
                    const oldChannel = await interaction.guild.channels.fetch(config.channelId).catch(() => null);
                    if (oldChannel) {
                        const oldMsg = await oldChannel.messages.fetch(config.panelMessageId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => null);
                    }
                } catch (err) {
                    logger.warn(`[Verify] Could not delete old panel for guild ${interaction.guildId}`);
                }
            }

            // Send to channel
            const sentMessage = await channel.send({ embeds: [embed], components: [row] });

            // Store new message ID
            config.panelMessageId = sentMessage.id;
            await config.save();

            await interaction.editReply({ 
                content: `✅ Sistema di verifica configurato con successo in ${channel}!\nMessaggio ID: \`${sentMessage.id}\``,
                ephemeral: true 
            });

            logger.info(`[Verify] Setup completed for guild ${interaction.guildId} in channel ${channel.id}`);

        } catch (error) {
            logger.error('[Verify] Setup Error:', error);
            await interaction.editReply({ 
                content: '❌ Si è verificato un errore durante il setup del sistema di verifica.',
                ephemeral: true 
            });
        }
    }
};
