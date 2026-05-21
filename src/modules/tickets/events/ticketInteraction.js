import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, Events, MessageFlags, ModalBuilder, PermissionFlagsBits, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { getButtonStyle } from '../../../utils/uiBuilder.js';
import TicketConfig from '../../../models/TicketConfig.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
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
import StaffStatsService from '../../../services/staffStatsService.js';
import { t } from '../../../locales/t.js';
import { resolveSystemMessage } from '../../../utils/messageResolver.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.guild) return;

        // Early exit for non-ticket interactions
        const customId = interaction.customId || '';
        const isTicketInteraction = customId.includes('ticket') || customId.startsWith('tk_');
        if (!isTicketInteraction) return;

        // 1. Log customId for debugging
        logger.debug(`[TICKET_INTERACTION] User: ${interaction.user.tag} | CustomID: ${customId}`);

        // Special case: Priority selection for 'segnalazione' triggers a modal.
        // Modals MUST be shown BEFORE deferReply and cannot be deferred.
        if (interaction.isStringSelectMenu() && customId.startsWith('ticket_priority_select_')) {
            const config = await TicketConfig.findOne({ guildId: interaction.guildId });
            const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guildId });
            const lang = globalConfig?.language || 'en';
            const type = customId.replace('ticket_priority_select_', '');
            const priority = interaction.values[0];

            if (type === 'segnalazione') {
                const modal = new ModalBuilder().setCustomId(`ticket_modal_report_${priority}`).setTitle(resolveSystemMessage(config, 'tickets', 'report_modal_title', lang));
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('report_subject').setLabel(resolveSystemMessage(config, 'tickets', 'report_subject_label', lang)).setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('report_desc').setLabel(resolveSystemMessage(config, 'tickets', 'report_desc_label', lang)).setStyle(TextInputStyle.Paragraph).setRequired(true))
                );
                return interaction.showModal(modal);
            }
        }

        // 3. DeferReply BEFORE any await (to satisfy 3-second limit)
        // Modals need special handling: they can't be deferred if you want to show them,
        // but ModalSubmit interactions DO need a response.
        if (!interaction.deferred && !interaction.replied) {
            try {
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            } catch (error) {
                logger.error('[TICKET_DEFER_ERROR]', error);
                return;
            }
        }

        try {
            const config = await TicketConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                return messageService.reply(interaction, 'tickets', 'config_not_found', {}, { ephemeral: true });
            }

            const globalConfig = await GlobalConfig.findOne({ guildId: interaction.guildId });
            const lang = globalConfig?.language || 'en';

            // --- 1. TICKET CATEGORY EXTRACTION ---
            let type = null;
            if (interaction.isStringSelectMenu() && customId === 'ticket_create_select') {
                type = interaction.values[0].replace('ticket_type_', '');
            } else if (interaction.isButton() && (customId.startsWith('ticket_type_') || customId.startsWith('ticket_create_btn_'))) {
                type = customId.replace('ticket_type_', '').replace('ticket_create_btn_', '');
            }

            if (type) {
                const typeConfig = (config.typesConfig instanceof Map 
                    ? config.typesConfig.get(type) 
                    : config.typesConfig?.[type]);

                if (!typeConfig && type !== 'supporto') {
                    return messageService.reply(interaction, 'tickets', 'category_not_available', {}, { ephemeral: true });
                }

                const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);
                if (!permCheck.hasPermission) {
                    return interaction.editReply({ content: lang === 'it'
                        ? `❌ Il bot non ha i permessi necessari in questo canale: ${permCheck.missing.join(', ')}`
                        : `❌ The bot is missing required permissions in this channel: ${permCheck.missing.join(', ')}`
                    });
                }

                const existing = await Ticket.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, type, status: { $ne: 'CLOSED' } });
                if (existing) {
                    return interaction.editReply({ 
                        content: resolveSystemMessage(config, 'tickets', 'already_exists', lang, {
                            type: type.toUpperCase(),
                            channelId: existing.channelId,
                            channel: `<#${existing.channelId}>`
                        }) 
                    });
                }


                const priorityMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`ticket_priority_select_${type}`)
                        .setPlaceholder(resolveSystemMessage(config, 'tickets', 'priority_placeholder', lang))
                        .addOptions([
                            { label: resolveSystemMessage(config, 'tickets', 'priority_normal', lang), value: 'NORMALE', emoji: '🟢' },
                            { label: resolveSystemMessage(config, 'tickets', 'priority_important', lang), value: 'IMPORTANTE', emoji: '🟡' },
                            { label: resolveSystemMessage(config, 'tickets', 'priority_urgent', lang), value: 'URGENTE', emoji: '🔴' }
                        ])
                );

                const embed = await messageService.get(interaction.guild.id, 'tickets', 'priority_select', { 
                    type: type.toUpperCase() 
                });
                return interaction.editReply({ embeds: [embed], components: [priorityMenu] });
            }

            // --- 2. TICKET CREATION (Priority Selection) ---
            if (interaction.isStringSelectMenu() && customId.startsWith('ticket_priority_select_')) {
                const type = customId.replace('ticket_priority_select_', '');
                const priority = interaction.values[0];

                if (type === 'segnalazione') return; // Handled before defer

                return createTicket(interaction, type, config, { priority });
            }

            // --- 3. MODAL SUBMISSIONS (Report) ---
            if (interaction.isModalSubmit() && customId.startsWith('ticket_modal_report_')) {
                const priority = customId.replace('ticket_modal_report_', '');
                const subject = interaction.fields.getTextInputValue('report_subject');
                const description = interaction.fields.getTextInputValue('report_desc');

                return createTicket(interaction, 'segnalazione', config, { 
                    priority, 
                    subject, 
                    description 
                });
            }

            // --- 4. PRODUCTIVITY TOOLS & MODALS ---
            const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
            
            // Robust staff check (handles both string IDs and object IDs from older dashboard saves)
            const staffRoleIds = (Array.isArray(config.staffRoleIds) ? config.staffRoleIds : [])
                .map(r => typeof r === 'string' ? r : (r.id || r._id || String(r)));
            
            const userRoles = interaction.member.roles.cache || interaction.member.roles;
            const hasStaffRole = Array.isArray(userRoles) 
                ? staffRoleIds.some(roleId => userRoles.includes(roleId))
                : staffRoleIds.some(roleId => userRoles.has(roleId));

            const isStaff = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || 
                           interaction.guild.ownerId === interaction.user.id || 
                           hasStaffRole;
            
            const isAssigned = ticket.assignedStaffId === interaction.user.id;

            if (interaction.isButton() || interaction.isStringSelectMenu()) {
                if (!ticket) {
                    if (interaction.deferred) return messageService.reply(interaction, 'tickets', 'generic_error', { reason: 'Ticket not found in the database.' }, { ephemeral: true });
                    return;
                }

                // --- PERMISSION PROTECTION ---
                // Staff-only tools list
                const staffOnlyButtons = [
                    'tk_claim', 'tk_quick_reply', 'tk_tag', 'tk_status_select', 
                    'tk_note', 'tk_quick_reply_send', 'tk_tag_select'
                ];

                const isStaffTool = staffOnlyButtons.some(id => customId === id || customId.startsWith(id));
                const isCloseAction = customId === 'tk_close';

                // 1. Block regular users from staff tools
                if (isStaffTool && !isStaff) {
                    return messageService.reply(interaction, 'tickets', 'staff_only', {}, { ephemeral: true });
                }

                // 2. Block regular users from closing (Strict Staff Only)
                if (isCloseAction && !isStaff) {
                    return messageService.reply(interaction, 'tickets', 'staff_only', {}, { ephemeral: true });
                }


                // QUICK REPLIES
                if (customId === 'tk_quick_reply') {
                    if (!config.cannedResponses || !config.cannedResponses.length) {
                        return interaction.editReply({ content: resolveSystemMessage(config, 'tickets', 'no_quick_replies', lang) });
                    }

                    const menu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('tk_quick_reply_send')
                            .setPlaceholder(resolveSystemMessage(config, 'tickets', 'quick_reply_placeholder', lang))
                            .addOptions(config.cannedResponses.map(r => ({ label: r.label, value: r.label })))
                    );
                    const embed = await messageService.get(interaction.guild.id, 'tickets', 'quick_reply_menu', {});
                    return interaction.editReply({ embeds: [embed], components: [menu] });
                }

                if (interaction.isStringSelectMenu() && customId === 'tk_quick_reply_send') {
                    const label = interaction.values[0];
                    const template = config.cannedResponses.find(r => r.label === label);
                    if (!template) return interaction.editReply({ content: 'Template not found.' });

                    const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages]);
                    if (!permCheck.hasPermission) return interaction.editReply({ content: `Missing permissions to send messages: ${permCheck.missing.join(', ')}` });

                    const responseContent = placeholderHelper.replace(template.content, {
                        user: `<@${ticket.userId}>`,
                        staff: `${interaction.user}`
                    });

                    // Wrap quick reply in a simple embed for professionalism
                    const embed = new EmbedBuilder()
                        .setDescription(responseContent)
                        .setColor('#5865F2');

                    await interaction.channel.send({ embeds: [embed] });
                    return messageService.reply(interaction, 'tickets', 'success_open', { channel: 'Reply sent' }, { ephemeral: true });
                }

                // TAGGING
                if (customId === 'tk_tag') {
                    const tags = ['Bug', 'Pending', 'Donation', 'Support', 'Resolved'];
                    const menu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('tk_tag_select')
                            .setPlaceholder(resolveSystemMessage(config, 'tickets', 'tag_placeholder', lang))
                            .addOptions(tags.map(t => ({ label: t, value: t })))
                    );
                    const embed = await messageService.get(interaction.guild.id, 'tickets', 'tag_menu', {});
                    return interaction.editReply({ embeds: [embed], components: [menu] });
                }

                if (interaction.isStringSelectMenu() && customId === 'tk_tag_select') {
                    const tag = interaction.values[0];
                    if (!ticket.tags.includes(tag)) ticket.tags.push(tag);
                    await ticket.save();

                    const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                    await renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
                    return messageService.reply(interaction, 'tickets', 'note_success', { reason: 'Tag added' }, { ephemeral: true });
                }

                // CLAIM & STATUS
                if (customId === 'tk_claim') {
                    if (ticket.assignedStaffId) {
                        return messageService.reply(interaction, 'tickets', 'claim_already', { staffId: ticket.assignedStaffId }, { ephemeral: true });
                    }
                    ticket.assignedStaffId = interaction.user.id;
                    ticket.status = 'PROCESSING';
                    await ticket.save();
                    
                    // Record Stats
                    await StaffStatsService.recordClaim(interaction.guildId, interaction.user.id);

                    await messageService.reply(interaction, 'tickets', 'claim_success', {});
                    
                    interaction.channel.setName(`claimed-${interaction.channel.name}`).catch(() => {});
                    const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                    return renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
                }

                if (interaction.isStringSelectMenu() && customId === 'tk_status_select') {
                    ticket.status = interaction.values[0];
                    await ticket.save();
                    
                    await messageService.reply(interaction, 'tickets', 'status_updated_msg', { status: ticket.status });
                    
                    const embed = await messageService.get(interaction.guild.id, 'tickets', 'status_updated', {
                        status: ticket.status
                    });
                    await interaction.channel.send({ embeds: [embed] });
                    
                    const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                    return renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
                }

                // Standard buttons (CLOSE)
                if (customId === 'tk_close') {
                    const logChannel = config.logChannelId ? interaction.guild.channels.cache.get(config.logChannelId) : null;
                    const closeMode = config.closeMode || 'DELETE';

                    if (closeMode === 'DELETE' && logChannel) {
                        const logPermCheck = checkBotPermissions(logChannel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]);
                        if (!logPermCheck.hasPermission) {
                            return interaction.editReply({ content: `Cannot close: the bot is missing permissions in the log channel (${logPermCheck.missing.join(', ')})` });
                        }
                    }

                    if (closeMode === 'MOVE' && !config.categoryClosedId) {
                        return interaction.editReply({ content: 'Closed-ticket category is not configured in the dashboard.' });
                    }

                    await messageService.reply(interaction, 'tickets', 'close_started', {}, { ephemeral: true });
                    
                    ticket.status = 'CLOSED';
                    ticket.closedAt = new Date();

                    if (closeMode === 'DELETE') {
                        const transcript = await generateTranscription(interaction.channel, ticket);
                        if (logChannel) {
                            const logEmbed = await messageService.get(interaction.guild.id, 'tickets', 'staff_ticket_log', {
                                user: `<@${ticket.userId}>`,
                                type: ticket.type.toUpperCase(),
                                staff: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : 'None'
                            });
                            await logChannel.send({ embeds: [logEmbed], files: [transcript] });
                        }
                        ticket.deletionScheduledAt = new Date(Date.now() + 5000);
                    }

                    // Record Stats on Close
                    if (ticket.assignedStaffId) {
                        const responseTimeMs = ticket.firstResponseAt ? (ticket.firstResponseAt.getTime() - ticket.openedAt.getTime()) : 0;
                        await StaffStatsService.recordClose(interaction.guildId, ticket.assignedStaffId, responseTimeMs);
                    }
                    
                    if (closeMode === 'MOVE') {
                        try {
                            const newName = `closed-${interaction.channel.name}`.substring(0, 100);
                            await interaction.channel.setParent(config.categoryClosedId, { lockPermissions: false });
                            await interaction.channel.setName(newName);
                            await interaction.channel.permissionOverwrites.edit(ticket.userId, { ViewChannel: false });

                            const closedEmbed = await messageService.get(interaction.guild.id, 'tickets', 'close', {
                                user: `<@${ticket.userId}>`
                            });
                            await interaction.channel.send({ embeds: [closedEmbed] });
                        } catch (e) {
                            console.error('[TICKET_CLOSE_ERROR]', e);
                        }
                    }
                    
                    await ticket.save();

                    const closingUser = await interaction.guild.members.fetch(ticket.userId).catch(() => null);
                    await sendNotification({
                        event: 'tickets.onClose',
                        guildId: interaction.guild.id,
                        guild: interaction.guild,
                        user: closingUser?.user || null,
                        content: `Your ticket was closed successfully in **${interaction.guild.name}**.`
                    });
                    return;
                }

                // INTERNAL NOTES
                if (interaction.customId === 'tk_note') {
                    const modal = new ModalBuilder()
                        .setCustomId('tk_note_modal')
                        .setTitle(resolveSystemMessage(config, 'tickets', 'note_modal_title', lang));

                    const noteInput = new TextInputBuilder()
                        .setCustomId('note_content')
                        .setLabel(resolveSystemMessage(config, 'tickets', 'note_input_label', lang))
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder(resolveSystemMessage(config, 'tickets', 'note_input_placeholder', lang))
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(noteInput));
                    return interaction.showModal(modal);
                }
            }

            // --- 5. MODAL SUBMISSIONS (Note) ---
            if (interaction.isModalSubmit() && interaction.customId === 'tk_note_modal') {
                if (!ticket) return interaction.editReply({ content: 'Ticket not found.' });
                
                // Staff check for modal too (Administrator, has one of the staff roles, or is the assigned operator)
                const staffRoleIds = (Array.isArray(config.staffRoleIds) ? config.staffRoleIds : [])
                    .map(r => typeof r === 'string' ? r : (r.id || r._id || String(r)));
                
                const userRoles = interaction.member.roles.cache || interaction.member.roles;
                const hasStaffRole = Array.isArray(userRoles) 
                    ? staffRoleIds.some(roleId => userRoles.includes(roleId))
                    : staffRoleIds.some(roleId => userRoles.has(roleId));

                const isUserStaff = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || 
                                   interaction.guild.ownerId === interaction.user.id || 
                                   hasStaffRole;

                if (!isUserStaff) return messageService.reply(interaction, 'tickets', 'staff_only', {}, { ephemeral: true });

                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
                const content = interaction.fields.getTextInputValue('note_content');
                
                ticket.internalNotes.push({
                    staffId: interaction.user.id,
                    content: content,
                    createdAt: new Date()
                });
                await ticket.save();

                const typeConfig = (config.typesConfig instanceof Map 
                    ? config.typesConfig.get(ticket.type) 
                    : config.typesConfig?.[ticket.type]);
                const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                await renderTicketDashboard(interaction.channel, ticket, config, typeConfig, interaction.user, staffRoles, true);
                return messageService.reply(interaction, 'tickets', 'note_success', {}, { ephemeral: true });
            }

            // If we reached here without a response for a ticket interaction
            if (interaction.deferred) {
                return interaction.editReply({ content: '⚠️ L\'operazione è stata completata, ma non è stato possibile generare una risposta specifica.' });
            }

        } catch (error) {
            console.error('[TICKET_FATAL_ERROR]', error);

            logger.error('[TICKET_INTERACTION_FATAL]', error);
            const fatalMsg = 'Critical ticket system error. Please contact an administrator.';
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: fatalMsg });
            return interaction.reply({ content: fatalMsg, flags: [MessageFlags.Ephemeral] });
        }
    },
};

async function createTicket(interaction, type, config, metadata = {}) {
    let lang = 'en';
    try {
        const guild = interaction.guild;
        const user = interaction.user;
        const priority = metadata.priority || 'NORMAL';

        // --- BLACKLIST CHECK ---
        if (config.blacklist && config.blacklist.includes(user.id)) {
            return messageService.reply(interaction, 'tickets', 'blacklist_error', {}, { ephemeral: true });
        }

        logger.debug(`[TICKET_CREATE] Starting creation for ${user.tag} (Type: ${type}, Priority: ${priority})`);

        // Robust retrieval of typeConfig handling both Map and Object
        const typeConfig = (config.typesConfig instanceof Map 
            ? config.typesConfig.get(type) 
            : config.typesConfig?.[type]) || { color: '#3498db', emoji: '🎫' };

        const staffRoles = (config.staffRoleIds || []).map(id => guild.roles.cache.get(id)).filter(r => r);
        
        // --- CATEGORY VALIDATION ---
        const categoryId = config.categoryOpenId;
        const parentCategory = categoryId ? guild.channels.cache.get(categoryId) : null;
        
        if (categoryId && !parentCategory) {
            logger.error(`[TICKET_CREATE] Category ${categoryId} not found in guild cache.`);
            return interaction.editReply({ content: `Ticket category (ID: ${categoryId}) no longer exists. Contact an administrator.` });
        }

        // --- PERMISSION CHECK ---
        const permCheck = checkBotPermissions(parentCategory || guild.channels.cache.first(), [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ]);

        if (!permCheck.hasPermission) {
            logger.error(`[TICKET_CREATE] Missing permissions: ${permCheck.missing.join(', ')}`);
            const errorEmbed = await ErrorHelper.permissionsError(guild.id, permCheck.missing);
            return interaction.editReply({ embeds: [errorEmbed], components: [] });
        }

        // --- CHANNEL CREATION ---
        const globalConfig = await GlobalConfig.findOne({ guildId: guild.id });
        lang = globalConfig?.language || 'en';
        const namingTemplate = globalConfig?.naming?.ticket || '{emoji}-{type}-{user}';
        
        const priorityEmoji = priority === 'URGENT' ? '🔴' : (priority === 'IMPORTANT' ? '🟡' : '🟢');
        const channelName = placeholderHelper.replace(namingTemplate, {
            emoji: priorityEmoji,
            type: type,
            user: user.username
        }).substring(0, 100);

        let channel;
        try {
            channel = await guild.channels.create({ 
                name: channelName, 
                type: ChannelType.GuildText, 
                parent: categoryId 
            });
        } catch (err) {
            logger.error('[TICKET_CREATE] Channel creation failed:', err);
            return interaction.editReply({ content: lang === 'it'
                ? `❌ Impossibile creare il canale del ticket. Assicurati che il bot abbia il permesso 'Gestire Canali' e che la categoria sia valida.\n\`Dettagli: ${err.message}\``
                : `❌ Failed to create ticket channel. Make sure the bot has the 'Manage Channels' permission and that the category is valid.\n\`Details: ${err.message}\``
            });
        }
        
        await setInitialPermissions(channel, user, staffRoles);

        const ticket = await Ticket.create({ userId: user.id, guildId: guild.id, channelId: channel.id, type, priority, metadata });
        await renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles);

        // --- AUTO-PING ---
        const pingRoleId = typeConfig.pingRoleId;
        const pingContent = pingRoleId ? `<@&${pingRoleId}>` : '';
        
        await messageService.reply(interaction, 'tickets', 'created_success', { channelId: channel.id }, { ephemeral: true });

        if (pingRoleId) {
            const embed = new EmbedBuilder()
                .setDescription(resolveSystemMessage(config, 'tickets', 'new_ticket_ping', lang, { 
                    ping: pingContent, 
                    type: typeConfig.label || type 
                }))
                .setColor(typeConfig.color || '#3498db');

            await channel.send({ content: pingContent, embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
        }

        // GlobalConfig log for tickets.onOpen
        await sendLog({
            event: 'tickets.onOpen',
            guildId: guild.id,
            guild,
            content: `🎫 Nuovo ticket \`${type.toUpperCase()}\` aperto da <@${user.id}> — ${channel}`
        });

    } catch (error) { 
        logger.error('[TICKET_CREATE_FATAL]', error);
        if (interaction.deferred || interaction.replied) {
            const fatalCreateMsg = lang === 'it'
                ? '❌ Si è verificato un errore critico durante la creazione del ticket.'
                : '❌ A critical error occurred while creating the ticket.';
            await interaction.editReply({ content: fatalCreateMsg }).catch(() => {});
        }
    }
}

async function renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles = [], isUpdate = false) {
    const permCheck = checkBotPermissions(channel);
    if (!permCheck.hasPermission) return logger.error(`[TICKET] Missing permissions to render dashboard in ${channel.name}`);

    const globalConfig = await GlobalConfig.findOne({ guildId: channel.guildId });
    const lang = globalConfig?.language || 'en';

    // Fetch Intelligence Data
    const intelEmbed = await generateIntelligenceEmbed(channel.guild, ticket.userId);

    const embed = await messageService.get(channel.guildId, 'tickets', 'ticket', {
        type: typeConfig?.label?.toUpperCase() || ticket.type.toUpperCase(),
        user_id: ticket.userId,
        priority: ticket.priority,
        status: ticket.status,
        assignedStaff: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : resolveSystemMessage(config, 'tickets', 'waiting_staff', lang),
        tags: ticket.tags.length > 0 ? ticket.tags.map(t => `\`${t}\``).join(' ') : resolveSystemMessage(config, 'tickets', 'none', lang)
    });

    if (typeConfig?.welcomeMessage) {
        embed.setDescription(placeholderHelper.replace(typeConfig.welcomeMessage, {
            type: typeConfig?.label?.toUpperCase() || ticket.type.toUpperCase(),
            user_id: ticket.userId,
            priority: ticket.priority,
            status: ticket.status,
            assignedStaff: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : resolveSystemMessage(config, 'tickets', 'waiting_staff', lang),
            tags: ticket.tags.length > 0 ? ticket.tags.map(t => `\`${t}\``).join(' ') : resolveSystemMessage(config, 'tickets', 'none', lang),
            user: user,
            guild: channel.guild
        }));
    }

    if (ticket.assignedStaffId) {
        embed.addFields({ name: resolveSystemMessage(config, 'tickets', 'assigned_staff_label', lang), value: `<@${ticket.assignedStaffId}>`, inline: true });
    }
    
    // Add Intelligence directly into the main embed (Compact)
    if (intelEmbed && intelEmbed.data.fields && intelEmbed.data.fields.length > 1) {
        const stats = intelEmbed.data.fields.map(f => `${f.name}: ${f.value}`).join('\n');
        embed.addFields({ name: t('tickets.intelligence.field_name', lang), value: stats, inline: false });
    }

    if (ticket.internalNotes && ticket.internalNotes.length > 0) {
        const notes = ticket.internalNotes.map(n => `• **<@${n.staffId}>**: ${n.content}`).join('\n');
        embed.addFields({ name: resolveSystemMessage(config, 'tickets', 'internal_notes_label', lang), value: notes.substring(0, 1024), inline: false });
    }

    if (typeConfig?.image) embed.setImage(typeConfig.image);

    const buttons = config.buttons || {};
    const btnRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('tk_claim')
            .setLabel(buttons.claim?.label || resolveSystemMessage(config, 'tickets', 'claim_btn', lang))
            .setEmoji(buttons.claim?.emoji || '🙋‍♂️')
            .setStyle(getButtonStyle(buttons.claim?.style))
            .setDisabled(!!ticket.assignedStaffId),
        new ButtonBuilder()
            .setCustomId('tk_close')
            .setLabel(buttons.close?.label || resolveSystemMessage(config, 'tickets', 'close_btn', lang))
            .setEmoji(buttons.close?.emoji || '🔒')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('tk_quick_reply')
            .setLabel(buttons.quickReply?.label || resolveSystemMessage(config, 'tickets', 'quick_reply_btn', lang))
            .setEmoji(buttons.quickReply?.emoji || '📝')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('tk_note')
            .setLabel(resolveSystemMessage(config, 'tickets', 'note_btn', lang))
            .setEmoji('📌')
            .setStyle(ButtonStyle.Secondary)
    );

    const statusMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('tk_status_select')
            .setPlaceholder(resolveSystemMessage(config, 'tickets', 'status_placeholder', lang))
            .addOptions([
                { label: resolveSystemMessage(config, 'tickets', 'status_processing', lang), value: 'PROCESSING', emoji: '⚙️' },
                { label: resolveSystemMessage(config, 'tickets', 'status_waiting', lang), value: 'WAITING', emoji: '⏳' }
            ])
    );

    if (isUpdate) {
        const messages = await channel.messages.fetch({ limit: 20 });
        // Find dashboard by checking for the bot author and the specific title structure
        const dashboard = messages.find(m => m.author.id === channel.client.user.id && m.embeds[0]?.title?.includes('Pratica'));
        if (dashboard) return dashboard.edit({ embeds: [embed], components: [btnRow, statusMenu] });
    }

    const mention = staffRoles.length > 0 ? staffRoles.map(r => r.toString()).join(' ') : '';
    await channel.send({ content: mention || undefined, embeds: [embed], components: [btnRow, statusMenu] });
}

export { createTicket };
