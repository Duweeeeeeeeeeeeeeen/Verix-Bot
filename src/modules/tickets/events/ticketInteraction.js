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
            const type = customId.replace('ticket_priority_select_', '');
            const priority = interaction.values[0];

            if (type === 'segnalazione') {
                const modal = new ModalBuilder().setCustomId(`ticket_modal_report_${priority}`).setTitle('Modulo Segnalazione');
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('report_subject').setLabel('Soggetto').setStyle(TextInputStyle.Short).setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('report_desc').setLabel('Descrizione').setStyle(TextInputStyle.Paragraph).setRequired(true))
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
                const errorContent = '❌ Configurazione ticket non trovata per questo server. Contatta un amministratore.';
                return interaction.editReply({ content: errorContent });
            }

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
                    return interaction.editReply({ content: '❌ Questa categoria di ticket non è più disponibile.' });
                }

                const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);
                if (!permCheck.hasPermission) {
                    return interaction.editReply({ content: `❌ Il bot non ha i permessi necessari in questo canale: ${permCheck.missing.join(', ')}` });
                }

                const existing = await Ticket.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, type, status: { $ne: 'CLOSED' } });
                if (existing) {
                    const embed = await messageService.get(interaction.guild.id, 'tickets', 'already_exists', {
                        type: type.toUpperCase(),
                        channelId: existing.channelId
                    });
                    return interaction.editReply({ embeds: [embed] });
                }

                const priorityMenu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`ticket_priority_select_${type}`)
                        .setPlaceholder('Seleziona la priorità del tuo ticket...')
                        .addOptions([
                            { label: 'Normale', value: 'NORMALE', emoji: '🟢' },
                            { label: 'Importante', value: 'IMPORTANTE', emoji: '🟡' },
                            { label: 'Urgente', value: 'URGENTE', emoji: '🔴' }
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

            // --- 4. PRODUCTIVITY TOOLS (Staff Only) ---
            if (interaction.isButton() || interaction.isStringSelectMenu()) {
                const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
                if (!ticket) {
                    if (interaction.deferred) return interaction.editReply({ content: '❌ Errore: Questo canale non è associato a un ticket attivo nel database.' });
                    return;
                }

                // QUICK REPLIES
                if (customId === 'tk_quick_reply') {
                    if (!config.cannedResponses || !config.cannedResponses.length) {
                        return interaction.editReply({ content: '❌ Nessuna risposta rapida configurata nella dashboard.' });
                    }

                    const menu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('tk_quick_reply_send')
                            .setPlaceholder('Scegli un template da inviare...')
                            .addOptions(config.cannedResponses.map(r => ({ label: r.label, value: r.label })))
                    );
                    const embed = await messageService.get(interaction.guild.id, 'tickets', 'quick_reply_menu', {});
                    return interaction.editReply({ embeds: [embed], components: [menu] });
                }

                if (interaction.isStringSelectMenu() && customId === 'tk_quick_reply_send') {
                    const label = interaction.values[0];
                    const template = config.cannedResponses.find(r => r.label === label);
                    if (!template) return interaction.editReply({ content: '❌ Errore: Template selezionato non trovato.' });

                    const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages]);
                    if (!permCheck.hasPermission) return interaction.editReply({ content: `❌ Permessi insufficienti per inviare messaggi: ${permCheck.missing.join(', ')}` });

                    const responseContent = placeholderHelper.replace(template.content, {
                        user: `<@${ticket.userId}>`,
                        staff: `${interaction.user}`
                    });

                    await interaction.channel.send({ content: responseContent });
                    return interaction.editReply({ content: `✅ Risposta rapida inviata: \`${label}\``, components: [] });
                }

                // TAGGING
                if (customId === 'tk_tag') {
                    const tags = ['Bug 🐛', 'Sospeso ⛔', 'Donazione 💰', 'RP Help 🎭', 'Risolto ✅'];
                    const menu = new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('tk_tag_select')
                            .setPlaceholder('Seleziona un protocollo...')
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
                    return interaction.editReply({ content: `✅ Tag \`${tag}\` aggiunto con successo.` });
                }

                // CLAIM & STATUS
                if (customId === 'tk_claim') {
                    if (ticket.assignedStaffId) {
                        return interaction.editReply({ content: `❌ Questo ticket è già stato preso in carico da <@${ticket.assignedStaffId}>.` });
                    }
                    ticket.assignedStaffId = interaction.user.id;
                    ticket.status = 'PROCESSING';
                    await ticket.save();
                    
                    // Record Stats
                    await StaffStatsService.recordClaim(interaction.guildId, interaction.user.id);

                    await interaction.editReply({ content: '✅ Ticket preso in carico correttamente.' });
                    
                    interaction.channel.setName(`⚙️-${interaction.channel.name}`).catch(() => {});
                    const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                    return renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
                }

                if (interaction.isStringSelectMenu() && customId === 'tk_status_select') {
                    ticket.status = interaction.values[0];
                    await ticket.save();
                    
                    await interaction.editReply({ content: `✅ Stato del ticket aggiornato a: **${ticket.status}**` });
                    
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
                            return interaction.editReply({ content: `❌ Impossibile chiudere: il bot non ha i permessi nel canale log (${logPermCheck.missing.join(', ')})` });
                        }
                    }

                    if (closeMode === 'MOVE' && !config.categoryClosedId) {
                        return interaction.editReply({ content: '❌ Errore: Categoria per i ticket chiusi non configurata nella dashboard.' });
                    }

                    await interaction.editReply({ content: '🛡️ **Protocollo di chiusura avviato...**' });
                    
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
                        content: `🔒 Il tuo ticket è stato chiuso correttamente in **${interaction.guild.name}**.`
                    });
                    return;
                }

                // INTERNAL NOTES
                if (interaction.customId === 'tk_note') {
                    const modal = new ModalBuilder()
                        .setCustomId('tk_note_modal')
                        .setTitle('Aggiungi Nota Interna');

                    const noteInput = new TextInputBuilder()
                        .setCustomId('note_content')
                        .setLabel('Contenuto della nota')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Scrivi qui una nota visibile solo allo staff...')
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(noteInput));
                    return interaction.showModal(modal);
                }

                if (interaction.isModalSubmit() && interaction.customId === 'tk_note_modal') {
                    await interaction.deferReply({ ephemeral: true });
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
                    return interaction.editReply({ content: '✅ Nota interna aggiunta con successo.' });
                }
            }

            // If we reached here without a response for a ticket interaction
            if (interaction.deferred) {
                return interaction.editReply({ content: '⚠️ L\'operazione è stata completata, ma non è stato possibile generare una risposta specifica.' });
            }

        } catch (error) {
            console.error('[TICKET_FATAL_ERROR]', error);

            logger.error('[TICKET_INTERACTION_FATAL]', error);
            const fatalMsg = '❌ Errore critico nel sistema ticket. Contatta un amministratore.';
            if (interaction.deferred || interaction.replied) return interaction.editReply({ content: fatalMsg });
            return interaction.reply({ content: fatalMsg, flags: [MessageFlags.Ephemeral] });
        }
    },
};

async function createTicket(interaction, type, config, metadata = {}) {
    try {
        const guild = interaction.guild;
        const user = interaction.user;
        const priority = metadata.priority || 'NORMALE';

        // --- BLACKLIST CHECK ---
        if (config.blacklist && config.blacklist.includes(user.id)) {
            return interaction.editReply({ 
                content: '❌ **ACCESSO NEGATO:** Ti è stato vietato l\'utilizzo del sistema di assistenza.' 
            });
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
            return interaction.editReply({ content: `❌ Errore: La categoria dei ticket (ID: \`${categoryId}\`) non esiste più. Contatta un amministratore.` });
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
        const namingTemplate = globalConfig?.naming?.ticket || '{emoji}-{type}-{user}';
        
        const priorityEmoji = priority === 'URGENTE' ? '🔴' : (priority === 'IMPORTANTE' ? '🟡' : '🟢');
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
            return interaction.editReply({ content: `❌ Impossibile creare il canale del ticket. Assicurati che il bot abbia il permesso 'Gestire Canali' e che la categoria sia valida.\n\`Dettagli: ${err.message}\`` });
        }
        
        await setInitialPermissions(channel, user, staffRoles);

        const ticket = await Ticket.create({ userId: user.id, guildId: guild.id, channelId: channel.id, type, priority, metadata });
        await renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles);

        // --- AUTO-PING ---
        const pingRoleId = typeConfig.pingRoleId;
        const pingContent = pingRoleId ? `<@&${pingRoleId}>` : '';
        
        await interaction.editReply({ 
            content: `✅ **RICHIESTA PROTOCOLLATA:** Recati allo sportello ${channel}. ${pingContent}`, 
            embeds: [], 
            components: [] 
        });

        if (pingRoleId) {
            await channel.send({ content: `${pingContent} - Nuova istanza di tipo **${typeConfig.label || type}** aperta.` })
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
            await interaction.editReply({ content: '❌ Si è verificato un errore critico durante la creazione del ticket.' }).catch(() => {});
        }
    }
}

async function renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles = [], isUpdate = false) {
    const permCheck = checkBotPermissions(channel);
    if (!permCheck.hasPermission) return logger.error(`[TICKET] Missing permissions to render dashboard in ${channel.name}`);

    // Fetch Intelligence Data
    const intelEmbed = await generateIntelligenceEmbed(channel.guild, ticket.userId);

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
    
    // Add Intelligence directly into the main embed (Compact)
    if (intelEmbed && intelEmbed.data.fields) {
        const stats = intelEmbed.data.fields.map(f => `${f.name}: ${f.value}`).join('\n');
        embed.addFields({ name: '🔍 Intelligence Utente', value: stats, inline: false });
    }

    if (ticket.internalNotes && ticket.internalNotes.length > 0) {
        const notes = ticket.internalNotes.map(n => `• **<@${n.staffId}>**: ${n.content}`).join('\n');
        embed.addFields({ name: '📝 Note Interne', value: notes.substring(0, 1024), inline: false });
    }

    if (typeConfig?.image) embed.setImage(typeConfig.image);

    const buttons = config.buttons || {};
    const btnRow = new ActionRowBuilder().addComponents(
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
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('tk_quick_reply')
            .setLabel(buttons.quickReply?.label || 'Risposte Rapide')
            .setEmoji(buttons.quickReply?.emoji || '📝')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('tk_note')
            .setLabel('Nota')
            .setEmoji('📌')
            .setStyle(ButtonStyle.Secondary)
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
        const messages = await channel.messages.fetch({ limit: 20 });
        // Find dashboard by checking for the bot author and the specific title structure
        const dashboard = messages.find(m => m.author.id === channel.client.user.id && m.embeds[0]?.title?.includes('Pratica'));
        if (dashboard) return dashboard.edit({ embeds: [embed], components: [btnRow, statusMenu] });
    }

    const mention = staffRoles.length > 0 ? staffRoles.map(r => r.toString()).join(' ') : '@staff';
    await channel.send({ content: mention, embeds: [embed], components: [btnRow, statusMenu] });
}

export { createTicket };
