import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import TempVoice from '../../../models/TempVoice.js';
import messageService from '../../../utils/messageService.js';

async function refreshControlPanelLimit(channel, tempChannel, limit) {
    let message = null;

    if (tempChannel.controlMessageId) {
        message = await channel.messages.fetch(tempChannel.controlMessageId).catch(() => null);
    }

    if (!message) {
        const messages = await channel.messages.fetch({ limit: 20 }).catch(() => null);
        message = messages?.find(m =>
            m.author?.id === channel.client.user.id &&
            m.components?.some(row => row.components?.some(c => c.customId?.startsWith('tv_')))
        );

        if (message) {
            tempChannel.controlMessageId = message.id;
            await tempChannel.save().catch(() => null);
        }
    }

    const currentEmbed = message?.embeds?.[0];
    if (!message || !currentEmbed) return;

    const embed = currentEmbed.toJSON();
    const fields = Array.isArray(embed.fields) ? [...embed.fields] : [];
    const limitIndex = fields.findIndex(field => field.name?.toLowerCase().includes('limit') || field.name?.toLowerCase().includes('limite'));
    const displayLimit = limit > 0 ? String(limit) : (fields[limitIndex]?.name?.toLowerCase().includes('limite') ? 'None' : 'None');

    if (limitIndex >= 0) {
        fields[limitIndex] = { ...fields[limitIndex], value: displayLimit };
    } else {
        fields.push({ name: '👥 Limit', value: displayLimit, inline: true });
    }

    await message.edit({ embeds: [{ ...embed, fields }] }).catch(() => null);
}

export default {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            if (!interaction.customId.startsWith('tv_')) return;

            const tempChannel = await TempVoice.findOne({ channelId: interaction.channelId });
            if (!tempChannel) return messageService.reply(interaction, 'tempvoice', 'not_manageable', {}, { ephemeral: true });

            if (tempChannel.ownerId !== interaction.user.id) {
                return messageService.reply(interaction, 'tempvoice', 'not_owner', {}, { ephemeral: true });
            }

            const channel = interaction.channel;

            switch (interaction.customId) {
                case 'tv_lock':
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
                    await messageService.reply(interaction, 'tempvoice', 'lock_success', {}, { ephemeral: true });
                    break;

                case 'tv_unlock':
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
                    await messageService.reply(interaction, 'tempvoice', 'unlock_success', {}, { ephemeral: true });
                    break;

                case 'tv_inc':
                    const newLimitInc = Math.min(channel.userLimit + 1, 99);
                    await channel.setUserLimit(newLimitInc);
                    await refreshControlPanelLimit(channel, tempChannel, newLimitInc);
                    await messageService.reply(interaction, 'tempvoice', 'limit_update', { limit: newLimitInc }, { ephemeral: true });
                    break;

                case 'tv_dec':
                    const newLimitDec = Math.max(channel.userLimit - 1, 0);
                    await channel.setUserLimit(newLimitDec);
                    await refreshControlPanelLimit(channel, tempChannel, newLimitDec);
                    await messageService.reply(interaction, 'tempvoice', 'limit_update', { limit: newLimitDec }, { ephemeral: true });
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
                    return messageService.reply(interaction, 'tempvoice', 'not_owner', {}, { ephemeral: true });
                }

                await interaction.channel.setName(newName);
                await messageService.reply(interaction, 'tempvoice', 'rename_success', { name: newName }, { ephemeral: true });
            }
        }
    }
};
