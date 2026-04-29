import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Events, MessageFlags, ModalBuilder, PermissionFlagsBits, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { getButtonStyle } from '../../../utils/uiBuilder.js';
import TicketConfig from '../../../models/TicketConfig.js';
import Ticket from '../../../models/Ticket.js';
import Guild from '../../../models/Guild.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Background from '../../../models/Background.js';
import { setInitialPermissions, generateTranscription, generateIntelligenceEmbed, updateLastActivity } from '../utils/ticketHelper.js';
import { sendNotification, sendLog } from '../../../utils/notificationSender.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import { checkBotPermissions, formatMissingPermissions } from '../../../utils/permissionHelper.js';
import placeholderHelper from '../../../utils/placeholderHelper.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.guild) return;

        // Early exit for non-ticket interactions
        const isTicketInteraction = interaction.customId?.includes('ticket') || interaction.customId?.startsWith('tk_');
        if (!isTicketInteraction) return;

        const config = await TicketConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            logger.warn(`[Tickets] Config not found for guild ${interaction.guild.id}`);
            return;
        }

        // --- 1. TICKET CREATION (Dynamic Select Menu) ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_create_select') {
            const type = interaction.values[0];
            
            // Check permissions in the current channel before replying with menu
            const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);
            if (!permCheck.hasPermission) return interaction.reply({ content: formatMissingPermissions(permCheck.missing), flags: [MessageFlags.Ephemeral] });

            const existing = await Ticket.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, type, status: { $ne: 'CLOSED' } });
            if (existing) {
                return messageService.reply(interaction, 'tickets', 'already_exists', {
                    type: type.toUpperCase(),
                    channelId: existing.channelId
                }, { ephemeral: true });
            }

            const priorityMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`ticket_priority_select_${type}`)
                    .setPlaceholder('Seleziona la priorità...')
                    .addOptions([
                        { label: 'Normale', value: 'NORMALE', emoji: '🟢' },
                        { label: 'Importante', value: 'IMPORTANTE', emoji: '🟡' },
                        { label: 'Urgente', value: 'URGENTE', emoji: '🔴' }
                    ])
            );

            return messageService.reply(interaction, 'tickets', 'priority_select', { 
                type: type.toUpperCase() 
            }, { components: [priorityMenu], ephemeral: true });
        }

        // --- 1.1 TICKET CREATION (Dynamic Buttons) ---
        if (interaction.isButton() && interaction.customId.startsWith('ticket_create_btn_')) {
            const type = interaction.customId.split('_')[3];
            
            const existing = await Ticket.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, type, status: { $ne: 'CLOSED' } });
            if (existing) {
                return messageService.reply(interaction, 'tickets', 'already_exists', {
                    type: type.toUpperCase(),
                    channelId: existing.channelId
                }, { ephemeral: true });
            }

            const priorityMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`ticket_priority_select_${type}`)
                    .setPlaceholder('Seleziona la priorità...')
                    .addOptions([
                        { label: 'Normale', value: 'NORMALE', emoji: '🟢' },
                        { label: 'Importante', value: 'IMPORTANTE', emoji: '🟡' },
                        { label: 'Urgente', value: 'URGENTE', emoji: '🔴' }
                    ])
            );

            return messageService.reply(interaction, 'tickets', 'priority_select', { 
                type: type.toUpperCase() 
            }, { components: [priorityMenu], ephemeral: true });
        }

        // --- 2. TICKET CREATION (Priority Selection) ---
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_priority_select_')) {
            const type = interaction.customId.split('_')[3];
            const priority = interaction.values[0];

            if (type === 'segnalazione') {
                const modal = new ModalBuilder().setCustomId(`ticket_modal_report_${priority}`).setTitle('Modulo Segnalazione');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('report_subject').setLabel('Soggetto').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('report_desc').setLabel('Descrizione').setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return interaction.showModal(modal);
            }

            // Defer if not showing a modal
            if (type !== 'segnalazione') {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            }
            return createTicket(interaction, type, config, { priority });
        }

        // --- 3. PRODUCTIVITY TOOLS (Staff Only) ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
            if (!ticket) return;

            // QUICK REPLIES (Canned Responses)
            if (interaction.customId === 'tk_quick_reply') {
                if (!config.cannedResponses.length) {
                    const embed = await messageService.get(interaction.guild.id, 'system', 'generic_error', {
                        error: 'Nessuna risposta rapida configurata nella dashboard.'
                    });
                    return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
                }

                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('tk_quick_reply_send')
                        .setPlaceholder('Scegli un template...')
                        .addOptions(config.cannedResponses.map(r => ({ label: r.label, value: r.label })))
                );
                return messageService.reply(interaction, 'tickets', 'quick_reply_menu', {}, { components: [menu], ephemeral: true });
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'tk_quick_reply_send') {
                const label = interaction.values[0];
                const template = config.cannedResponses.find(r => r.label === label);
                if (!template) return;

                // Check permissions before sending quick reply
                const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages]);
                if (!permCheck.hasPermission) return interaction.reply({ content: formatMissingPermissions(permCheck.missing), flags: [MessageFlags.Ephemeral] });

                const responseContent = placeholderHelper.replace(template.content, {
                    user: `<@${ticket.userId}>`,
                    staff: `${interaction.user}`
                });

                await interaction.channel.send({ content: responseContent });
                return interaction.update({ content: `✅ Inviato: \`${label}\``, components: [] });
            }

            // TAGGING
            if (interaction.customId === 'tk_tag') {
                const tags = ['Bug 🐛', 'Sospeso ⛔', 'Donazione 💰', 'RP Help 🎭', 'Risolto ✅'];
                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('tk_tag_select')
                        .setPlaceholder('Seleziona un tag...')
                        .addOptions(tags.map(t => ({ label: t, value: t })))
                );
                return messageService.reply(interaction, 'tickets', 'tag_menu', {}, { components: [menu], ephemeral: true });
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'tk_tag_select') {
                const tag = interaction.values[0];
                if (!ticket.tags.includes(tag)) ticket.tags.push(tag);
                await ticket.save();

                const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                return renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
            }

            // CLAIM & STATUS
            if (interaction.customId === 'tk_claim') {
                if (ticket.assignedStaffId) {
                    const embed = await messageService.get(interaction.guild.id, 'tickets', 'already_claimed', {
                        assignedStaffId: ticket.assignedStaffId
                    });
                    return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
                }
                ticket.assignedStaffId = interaction.user.id;
                ticket.status = 'PROCESSING';
                await ticket.save();
                
                const embed = await messageService.get(interaction.guild.id, 'tickets', 'staff_claimed', {
                    staff: `<@${interaction.user.id}>`
                });
                await interaction.reply({ embeds: [embed] });
                
                // Background updates
                interaction.channel.setName(`⚙️-${interaction.channel.name}`).catch(() => {});
                const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'tk_status_select') {
                ticket.status = interaction.values[0];
                await ticket.save();
                const embed = await messageService.get(interaction.guild.id, 'tickets', 'status_updated', {
                    status: ticket.status
                });
                await interaction.reply({ embeds: [embed] });
                const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                return renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
            }

            // Standard buttons
            if (interaction.customId === 'tk_close') {
                const logChannel = config.logChannelId ? interaction.guild.channels.cache.get(config.logChannelId) : null;
                const closeMode = config.closeMode || 'DELETE';

                if (closeMode === 'DELETE') {
                        if (logChannel) {
                            const logPermCheck = checkBotPermissions(logChannel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]);
                            if (!logPermCheck.hasPermission) {
                                return messageService.reply(interaction, 'tickets', 'close_error_logs', {
                                    channel: logChannel.name,
                                    missing: logPermCheck.missing.join(', ')
                                }, { ephemeral: true });
                            }
                        }
                } else if (closeMode === 'MOVE') {
                    if (!config.categoryClosedId) {
                        return messageService.reply(interaction, 'tickets', 'close_error_category', {}, { ephemeral: true });
                    }
                }

                await messageService.reply(interaction, 'tickets', 'close_status', {}, { content: '🛡️ **Chiusura professionale...**' });
                
                ticket.status = 'CLOSED';
                ticket.closedAt = new Date();

                if (closeMode === 'DELETE') {
                    const transcript = await generateTranscription(interaction.channel, ticket);
                    
                    if (logChannel) {
                        const logEmbed = await messageService.get(interaction.guild.id, 'tickets', 'staff_ticket_log', {
                            user: `<@${ticket.userId}>`,
                            type: ticket.type.toUpperCase(),
                            staff: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : 'Nessuno'
                        });
                        await logChannel.send({ embeds: [logEmbed], files: [transcript] });
                    }
                    ticket.deletionScheduledAt = new Date(Date.now() + 5000);
                } else if (closeMode === 'MOVE') {
                    try {
                        const newName = interaction.channel.name.startsWith('closed-') ? interaction.channel.name : `closed-${interaction.channel.name}`.substring(0, 100);
                        await interaction.channel.setParent(config.categoryClosedId, { lockPermissions: false });
                        await interaction.channel.setName(newName);
                        
                        // Remove user visibility, leave staff untouched
                        await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false });

                        const closedEmbed = await messageService.get(interaction.guild.id, 'tickets', 'close', {
                            user: `<@${ticket.userId}>`
                        });
                        await interaction.channel.send({ embeds: [closedEmbed] });
                    } catch (e) {
                        logger.error('[TICKET_CLOSE_MOVE] Error moving channel:', e);
                    }
                }
                
                await ticket.save();

                // GlobalConfig notification & log for tickets.onClose
                const closingUser = await interaction.guild.members.fetch(ticket.userId).catch(() => null);
                await sendNotification({
                    event: 'tickets.onClose',
                    guildId: interaction.guild.id,
                    guild: interaction.guild,
                    user: closingUser?.user || null,
                    content: `🔒 Il tuo ticket è stato chiuso da ${interaction.user} in **${interaction.guild.name}**.`
                });
                await sendLog({
                    event: 'tickets.onClose',
                    guildId: interaction.guild.id,
                    guild: interaction.guild,
                    content: `🔒 Ticket \`${ticket.type}\` di <@${ticket.userId}> **chiuso** da ${interaction.user}`
                });
            }
        }
    },
};

async function createTicket(interaction, type, config, metadata = {}) {
    try {
        const guild = interaction.guild;
        const user = interaction.user;
        const priority = metadata.priority || 'NORMALE';

        // Robust retrieval of typeConfig handling both Map and Object
        const typeConfig = (config.typesConfig instanceof Map 
            ? config.typesConfig.get(type) 
            : config.typesConfig?.[type]) || { color: '#3498db', emoji: '🎫' };

        const staffRoles = (config.staffRoleIds || []).map(id => guild.roles.cache.get(id)).filter(r => r);
        // --- PERMISSION CHECK ---
        const parentCategory = config.categoryOpenId ? guild.channels.cache.get(config.categoryOpenId) : null;
        const permCheck = checkBotPermissions(parentCategory || guild.channels.cache.first(), [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ]);

        if (!permCheck.hasPermission) {
            const errorEmbed = await ErrorHelper.permissionsError(guild.id, permCheck.missing);
            if (interaction.deferred || interaction.replied) await interaction.editReply({ embeds: [errorEmbed], components: [] });
            else await interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            return;
        }

        const priorityEmoji = priority === 'URGENTE' ? '🔴' : (priority === 'IMPORTANTE' ? '🟡' : '🟢');
        const channel = await guild.channels.create({ 
            name: `${priorityEmoji}-${type}-${user.username}`, 
            type: ChannelType.GuildText, 
            parent: config.categoryOpenId 
        });
        
        await setInitialPermissions(channel, user, staffRoles);

        const ticket = await Ticket.create({ userId: user.id, guildId: guild.id, channelId: channel.id, type, priority, metadata });
        await renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles);

        const intelEmbed = await generateIntelligenceEmbed(guild, user.id);
        if (intelEmbed) await channel.send({ embeds: [intelEmbed] });

        await messageService.reply(interaction, 'tickets', 'success_open', {
            channel: `${channel}`
        }, { ephemeral: true });

        // GlobalConfig log for tickets.onOpen
        await sendLog({
            event: 'tickets.onOpen',
            guildId: guild.id,
            guild,
            content: `🎫 Nuovo ticket \`${type.toUpperCase()}\` aperto da <@${user.id}> — ${channel}`
        });

    } catch (error) { logger.error('Error creating ticket:', error); }
}

async function renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles = [], isUpdate = false) {
    const permCheck = checkBotPermissions(channel);
    if (!permCheck.hasPermission) return logger.error(`[TICKET] Missing permissions to render dashboard in ${channel.name}`);

    const embed = await messageService.get(channel.guildId, 'tickets', 'ticket', {
        type: ticket.type.toUpperCase(),
        user_id: ticket.userId,
        priority: ticket.priority,
        status: ticket.status,
        assignedStaff: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : '_In attesa..._',
        tags: ticket.tags.length > 0 ? ticket.tags.map(t => `\`${t}\``).join(' ') : '_Nessuna_'
    });

    if (ticket.assignedStaffId) {
        embed.addFields({ name: '👤 Operatore Assegnato', value: `<@${ticket.assignedStaffId}>`, inline: true });
    }
    
    if (ticket.tags.length > 0) {
        embed.addFields({ name: '🏷️ Protocolli / Tag', value: ticket.tags.map(t => `\`${t}\``).join(' '), inline: true });
    }

    if (typeConfig?.image) embed.setImage(typeConfig.image);

    const buttons = config.buttons || {};
    const btnRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('tk_claim')
            .setLabel(buttons.claim?.label || 'Assumi')
            .setEmoji(buttons.claim?.emoji || '🙋‍♂️')
            .setStyle(getButtonStyle(buttons.claim?.style))
            .setDisabled(!!ticket.assignedStaffId),
        new ButtonBuilder()
            .setCustomId('tk_close')
            .setLabel(buttons.close?.label || 'Chiudi')
            .setEmoji(buttons.close?.emoji || '🔒')
            .setStyle(getButtonStyle(buttons.close?.style)),
        new ButtonBuilder()
            .setCustomId('tk_quick_reply')
            .setLabel(buttons.quickReply?.label || 'Risposte Rapide')
            .setEmoji(buttons.quickReply?.emoji || '📝')
            .setStyle(getButtonStyle(buttons.quickReply?.style))
    );

    const btnRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('tk_tag')
            .setLabel(buttons.tag?.label || 'Tagga')
            .setEmoji(buttons.tag?.emoji || '🏷️')
            .setStyle(getButtonStyle(buttons.tag?.style)),
        new ButtonBuilder()
            .setCustomId('tk_transcript')
            .setLabel(buttons.transcript?.label || 'Logs')
            .setEmoji(buttons.transcript?.emoji || '📄')
            .setStyle(getButtonStyle(buttons.transcript?.style))
    );

    const statusMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('tk_status_select')
            .setPlaceholder('Cambia stato...')
            .addOptions([
                { label: 'In Lavorazione', value: 'PROCESSING', emoji: '⚙️' },
                { label: 'In Attesa (Utente)', value: 'WAITING', emoji: '⏳' }
            ])
    );

    if (isUpdate) {
        const messages = await channel.messages.fetch({ limit: 10 });
        const dashboard = messages.find(m => m.embeds[0]?.title?.includes('Ticket:'));
        if (dashboard) return dashboard.edit({ embeds: [embed], components: [btnRow1, btnRow2, statusMenu] });
    }

    const mention = staffRoles.length > 0 ? staffRoles.map(r => r.toString()).join(' ') : '@staff';
    await channel.send({ content: mention, embeds: [embed], components: [btnRow1, btnRow2, statusMenu] });
}

export { createTicket };
