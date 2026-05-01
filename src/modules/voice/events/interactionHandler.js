import { PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import TempVoice from '../../../models/TempVoice.js';

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            if (!interaction.customId.startsWith('tv_')) return;

            const tempChannel = await TempVoice.findOne({ channelId: interaction.channelId });
            if (!tempChannel) return interaction.reply({ content: '❌ Questo canale non è più gestibile.', ephemeral: true });

            if (tempChannel.ownerId !== interaction.user.id) {
                return interaction.reply({ content: '❌ Solo il proprietario del canale può usare questi comandi!', ephemeral: true });
            }

            const channel = interaction.channel;

            switch (interaction.customId) {
                case 'tv_lock':
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
                    await interaction.reply({ content: '🔒 Canale chiuso a tutti!', ephemeral: true });
                    break;

                case 'tv_unlock':
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
                    await interaction.reply({ content: '🔓 Canale aperto a tutti!', ephemeral: true });
                    break;

                case 'tv_inc':
                    const newLimitInc = Math.min(channel.userLimit + 1, 99);
                    await channel.setUserLimit(newLimitInc);
                    await interaction.reply({ content: `➕ Limite impostato a ${newLimitInc}`, ephemeral: true });
                    break;

                case 'tv_dec':
                    const newLimitDec = Math.max(channel.userLimit - 1, 0);
                    await channel.setUserLimit(newLimitDec);
                    await interaction.reply({ content: `➖ Limite impostato a ${newLimitDec}`, ephemeral: true });
                    break;

                case 'tv_rename':
                    const modal = new ModalBuilder()
                        .setCustomId('tv_modal_rename')
                        .setTitle('Rinomina Canale');

                    const nameInput = new TextInputBuilder()
                        .setCustomId('new_name')
                        .setLabel('Nuovo Nome')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder(channel.name)
                        .setRequired(true)
                        .setMaxLength(32);

                    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
                    await interaction.showModal(modal);
                    break;
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'tv_modal_rename') {
                const newName = interaction.fields.getTextInputValue('new_name');
                const tempChannel = await TempVoice.findOne({ channelId: interaction.channelId });
                
                if (!tempChannel || tempChannel.ownerId !== interaction.user.id) {
                    return interaction.reply({ content: '❌ Non sei autorizzato.', ephemeral: true });
                }

                await interaction.channel.setName(newName);
                await interaction.reply({ content: `✅ Canale rinominato in: **${newName}**`, ephemeral: true });
            }
        }
    }
};
