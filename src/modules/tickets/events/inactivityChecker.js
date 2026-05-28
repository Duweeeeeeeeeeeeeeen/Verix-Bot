import { Events, EmbedBuilder } from 'discord.js';
import Ticket from '../../../models/Ticket.js';
import TicketConfig from '../../../models/TicketConfig.js';
import { generateTranscription } from '../utils/ticketHelper.js';
import messageService from '../../../utils/messageService.js';
import logger from '../../../utils/logger.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info('Inactivity Checker started for tickets...');

        // Check every 30 minutes
        setInterval(async () => {
            const openTickets = await Ticket.find({ status: { $ne: 'CLOSED' } });

            for (const ticket of openTickets) {
                const config = await TicketConfig.findOne({ guildId: ticket.guildId });
                if (!config) continue;
                if (!config.autoClose?.enabled) continue;

                const timeoutHours = config.autoClose?.hours || config.inactivityTimeout || 24;
                const timeoutMs = timeoutHours * 60 * 60 * 1000;
                const inactiveTime = Date.now() - new Date(ticket.lastActivityAt).getTime();

                if (inactiveTime > timeoutMs) {
                    const guild = client.guilds.cache.get(ticket.guildId);
                    if (!guild) continue;

                    const channel = guild.channels.cache.get(ticket.channelId);
                    if (!channel) {
                        // Channel deleted manually? Mark as closed.
                        ticket.status = 'CLOSED';
                        await ticket.save();
                        continue;
                    }

                    logger.info(`Auto-closing inactive ticket: ${channel.name}`);

                    try {
                        const transcript = await generateTranscription(channel, ticket);
                        const logChannel = guild.channels.cache.get(config.logChannelId);

                        if (logChannel) {
                            const ticketPanelId = ticket.metadata instanceof Map ? ticket.metadata.get('panelId') : ticket.metadata?.panelId;
                            const panel = ticketPanelId && Array.isArray(config.panels) ? config.panels.find(p => p.id === ticketPanelId) : null;
                            const panelTypesConfig = panel?.typesConfig;
                            const typeConfig = (panelTypesConfig instanceof Map ? panelTypesConfig.get(ticket.type) : panelTypesConfig?.[ticket.type])
                                || (config.typesConfig instanceof Map ? config.typesConfig.get(ticket.type) : config.typesConfig?.[ticket.type]);
                            const typeLabel = typeConfig?.label?.toUpperCase() || ticket.type.toUpperCase();

                            await messageService.send(logChannel, 'tickets', 'staff_ticket_log', {
                                user: `<@${ticket.userId}>`,
                                type: typeLabel,
                                staff: '`SYSTEM_INACTIVITY`'
                            }, { files: [transcript] });
                        }

                        await messageService.send(channel, 'tickets', 'inactivity_close');
                        
                        ticket.status = 'CLOSED';
                        ticket.closedAt = new Date();
                        ticket.closedBy = 'SYSTEM_INACTIVITY';
                        await ticket.save();

                        setTimeout(() => channel.delete().catch(() => {}), 10000);
                    } catch (error) {
                        logger.error(`Error auto-closing ticket ${ticket.channelId}:`, error);
                    }
                }
            }
        }, 30 * 60 * 1000); 
    },
};
