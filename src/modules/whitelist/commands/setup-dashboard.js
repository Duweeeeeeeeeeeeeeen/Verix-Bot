import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import { getDashboard } from '../utils/voiceDashboard.js';
import Guild from '../../../models/Guild.js';
import ErrorHelper from '../../../utils/errorHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-dashboard')
        .setDescription('Inizializza la Dashboard dello staff per la Voice Whitelist.')
        .addChannelOption(opt => opt.setName('channel').setDescription('Canale dove inviare la dashboard').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData || !guildData.enabledModules.includes('whitelist')) {
            const errorEmbed = await ErrorHelper.moduleDisabledError(interaction.guild.id, 'Whitelist');
            return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        }

        const channel = interaction.options.getChannel('channel');

        try {
            const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                return interaction.reply({ content: '❌ Configura prima la whitelist con `/setup-wl`.', flags: [MessageFlags.Ephemeral] });
            }

            const { embeds, components } = await getDashboard(interaction.guild.id);

            // --- AUTO-CLEANUP OLD DASHBOARD ---
            if (config.voiceSettings.dashboardMsgId && config.voiceSettings.dashboardChannelId) {
                try {
                    const oldChannel = await interaction.guild.channels.fetch(config.voiceSettings.dashboardChannelId).catch(() => null);
                    if (oldChannel) {
                        const oldMsg = await oldChannel.messages.fetch(config.voiceSettings.dashboardMsgId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => null);
                    }
                } catch (err) {
                    // Ignore cleanup errors
                }
            }

            const message = await channel.send({ embeds, components });

            config.voiceSettings.dashboardChannelId = channel.id;
            config.voiceSettings.dashboardMsgId = message.id;
            await config.save();

            await interaction.reply({ content: `✅ Dashboard inizializzata correttamente in ${channel}.`, flags: [MessageFlags.Ephemeral] });
        } catch (error) {
            console.error('Error in setup-dashboard:', error);
            await interaction.reply({ content: '❌ Errore durante l\'inizializzazione della dashboard.', flags: [MessageFlags.Ephemeral] });
        }
    },
};
