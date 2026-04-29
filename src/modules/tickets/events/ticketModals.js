import { Events, MessageFlags } from 'discord.js';
import TicketConfig from '../../../models/TicketConfig.js';
import { createTicket } from './ticketInteraction.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return;

        // User management modals are handled here

        if (interaction.customId === 'tk_add_user_modal' || interaction.customId === 'tk_remove_user_modal') {
            const userId = interaction.fields.getTextInputValue('user_id');
            const action = interaction.customId.includes('add') ? 'add' : 'remove';

            try {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) return messageService.reply(interaction, 'tickets', 'error', { reason: 'Utente non trovato.' }, { ephemeral: true });
                if (action === 'add') {
                    await interaction.channel.permissionOverwrites.edit(member, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true,
                        AttachFiles: true
                    });
                    await messageService.reply(interaction, 'tickets', 'user_managed', { user: `<@${userId}>`, action: 'aggiunto' });
                } else {
                    await interaction.channel.permissionOverwrites.delete(member);
                    await messageService.reply(interaction, 'tickets', 'user_managed', { user: `<@${userId}>`, action: 'rimosso' });
                }
            } catch (error) {
                logger.error('Error managing user in ticket:', error);
                await messageService.reply(interaction, 'tickets', 'error', { reason: 'Errore gestione utente.' }, { ephemeral: true });
            }
        }
    },
};
