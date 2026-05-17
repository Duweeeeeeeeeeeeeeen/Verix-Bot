import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Events, MessageFlags, PermissionFlagsBits } from 'discord.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import Background from '../../../models/Background.js';
import Guild from '../../../models/Guild.js';
import User from '../../../models/User.js';
import { buildEmbed } from '../../../utils/embedHelper.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'start_bg') return;

        // Module enablement check
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData || !guildData.enabledModules?.includes('background')) {
            return messageService.reply(interaction, 'background', 'error', { reason: 'Il modulo Background non è attivo su questo server.' }, { ephemeral: true });
        }

        try {
            const config = await BackgroundConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                return messageService.reply(interaction, 'background', 'error', { reason: 'Configurazione del modulo non trovata.' }, { ephemeral: true });
            }

            // Cooldown & Pending Check
            const existingPending = await Background.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, status: { $in: ['PENDING', 'SUBMITTED'] } });
            if (existingPending) {
                return messageService.reply(interaction, 'background', 'already_exists', {}, { ephemeral: true });
            }

            const userData = await User.findOne({ discordId: interaction.user.id }) || await User.create({ discordId: interaction.user.id, username: interaction.user.username });
            if (userData.lastBackgroundAttempt) {
                const cooldownMs = config.cooldown * 60 * 60 * 1000;
                const timePassed = Date.now() - userData.lastBackgroundAttempt.getTime();

                if (timePassed < cooldownMs) {
                    const timeLeft = cooldownMs - timePassed;
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return messageService.reply(interaction, 'background', 'cooldown_error', { time: `${hours}h ${minutes}m` }, { ephemeral: true });
                }
            }

            // Create Private Channel
            const channel = await interaction.guild.channels.create({
                name: `bg-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles],
                    },
                ],
            });

            // Create Initial Record
            await Background.create({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                channelId: channel.id,
                status: 'PENDING',
                link: 'TBD' // To be defined via modal
            });

            const embed = buildEmbed(config.embeds.instructions, {
                user: interaction.user,
                guild: interaction.guild.name
            }, config);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('finalize_bg')
                    .setLabel('Invia Modulo')
                    .setEmoji('📩')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_bg')
                    .setLabel('Annulla')
                    .setStyle(ButtonStyle.Danger)
            );

            await channel.send({ content: `${interaction.user}`, embeds: [embed], components: [row] });
            await messageService.reply(interaction, 'background', 'channel_created', { channel: `${channel}` }, { ephemeral: true });

        } catch (error) {
            logger.error('Error starting background submission:', error);
            await messageService.reply(interaction, 'background', 'error', { reason: 'Si è verificato un errore critico.' }, { ephemeral: true });
        }
    },
};
