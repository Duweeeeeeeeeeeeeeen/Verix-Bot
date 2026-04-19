import { Events, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, PermissionFlagsBits } from 'discord.js';
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

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.guild) return;

        // Update Last Activity - BACKGROUND
        if (interaction.channel?.name.includes('tk-') || interaction.channel?.name.includes('🟢-') || interaction.channel?.name.includes('🟡-') || interaction.channel?.name.includes('🔴-')) {
            updateLastActivity(interaction.channel.id).catch(() => {});
        }

        const config = await TicketConfig.findOne({ guildId: interaction.guild.id });
        if (!config) return;

        // --- 1. TICKET CREATION (Dynamic Select Menu) ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_create_select') {
            const type = interaction.values[0];
            
            // Check permissions in the current channel before replying with menu
            const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]);
            if (!permCheck.hasPermission) return interaction.reply({ content: formatMissingPermissions(permCheck.missing), ephemeral: true });

            const existing = await Ticket.findOne({ userId: interaction.user.id, guildId: interaction.guild.id, type, status: { $ne: 'CLOSED' } });
            if (existing) {
                const solution = `Hai già un ticket di tipo **${type}** attivo (<#${existing.channelId}>). Chiudilo prima di aprirne uno nuovo.`;
                return interaction.reply({ 
                    content: ErrorHelper.formatActionable('⚠️', 'Ticket Duplicato', solution), 
                    ephemeral: true 
                });
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

            return interaction.reply({ content: `### 🎫 Priorità richiesta\nTipo: \`${type.toUpperCase()}\``, components: [priorityMenu], ephemeral: true });
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

            return createTicket(interaction, type, config, { priority });
        }

        // --- 3. PRODUCTIVITY TOOLS (Staff Only) ---
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
            if (!ticket) return;

            // QUICK REPLIES (Canned Responses)
            if (interaction.customId === 'tk_quick_reply') {
                if (!config.cannedResponses.length) {
                    return interaction.reply({ 
                        content: ErrorHelper.formatActionable('❌', 'Nessuna Risposta Rapida', 'Configura i template nella Dashboard sotto la sezione **Tickets -> Risposte Rapide**.'), 
                        ephemeral: true 
                    });
                }

                const menu = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('tk_quick_reply_send')
                        .setPlaceholder('Scegli un template...')
                        .addOptions(config.cannedResponses.map(r => ({ label: r.label, value: r.label })))
                );
                return interaction.reply({ content: '📝 **Seleziona la risposta da inviare:**', components: [menu], ephemeral: true });
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'tk_quick_reply_send') {
                const label = interaction.values[0];
                const template = config.cannedResponses.find(r => r.label === label);
                if (!template) return;

                // Check permissions before sending quick reply
                const permCheck = checkBotPermissions(interaction.channel, [PermissionFlagsBits.SendMessages]);
                if (!permCheck.hasPermission) return interaction.reply({ content: formatMissingPermissions(permCheck.missing), ephemeral: true });

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
                return interaction.reply({ content: '🏷️ **Aggiungi un tag al ticket:**', components: [menu], ephemeral: true });
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
                    return interaction.reply({ 
                        content: ErrorHelper.formatActionable('⚠️', 'Ticket già preso in carico', `Questo ticket è già gestito da <@${ticket.assignedStaffId}>.`), 
                        ephemeral: true 
                    });
                }
                ticket.assignedStaffId = interaction.user.id;
                ticket.status = 'PROCESSING';
                await ticket.save();
                
                // Immediate response for claim
                await interaction.reply({ content: `✅ <@${interaction.user.id}> ha preso in carico il ticket.` });
                
                // Background updates
                channel.setName(`⚙️-${channel.name}`).catch(() => {});
                const staffRoles = (config.staffRoleIds || []).map(id => guild.roles.cache.get(id)).filter(r => r);
                renderTicketDashboard(channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
                return;
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'tk_status_select') {
                ticket.status = interaction.values[0];
                await ticket.save();
                await interaction.reply({ content: `🔄 Stato aggiornato a: **${ticket.status}**` });
                const staffRoles = (config.staffRoleIds || []).map(id => interaction.guild.roles.cache.get(id)).filter(r => r);
                return renderTicketDashboard(interaction.channel, ticket, config, config.typesConfig.get(ticket.type), interaction.user, staffRoles, true);
            }

            // Standard buttons
            if (interaction.customId === 'tk_close') {
                // Check permissions specifically for logging channel before closing
                const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    const logPermCheck = checkBotPermissions(logChannel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles]);
                    if (!logPermCheck.hasPermission) {
                        return interaction.reply({ 
                            content: `❌ **Errore Chiusura:** Il bot non ha i permessi necessari nel canale LOGS (${logChannel.name}).\nRichiesti: ${logPermCheck.missing.join(', ')}`, 
                            ephemeral: true 
                        });
                    }
                }

                await interaction.reply('🛡️ **Chiusura professionale...**');
                const transcript = await generateTranscription(interaction.channel, ticket);
                
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📁 Archivio Ticket')
                        .addFields(
                            { name: 'Utente', value: `<@${ticket.userId}>`, inline: true }, 
                            { name: 'Tipo', value: `\`${ticket.type.toUpperCase()}\``, inline: true }, 
                            { name: 'Staff', value: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : 'Nessuno', inline: true }
                        )
                        .setColor('#ff4757')
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed], files: [transcript] });
                }
                ticket.status = 'CLOSED';
                ticket.closedAt = new Date();
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

                ticket.deletionScheduledAt = new Date(Date.now() + 5000);
                await ticket.save();
            }
        }
    },
};

async function createTicket(interaction, type, config, metadata = {}) {
    const guild = interaction.guild;
    const user = interaction.user;
    const staffRoles = (config.staffRoleIds || []).map(id => guild.roles.cache.get(id)).filter(r => r);
    const typeConfig = config.typesConfig.get(type) || { color: '#3498db', emoji: '🎫' };
    const priority = metadata.priority || 'NORMALE';

    try {
        // --- PERMISSION CHECK ---
        const parentCategory = config.categoryOpenId ? guild.channels.cache.get(config.categoryOpenId) : null;
        const permCheck = checkBotPermissions(parentCategory || guild.channels.cache.first(), [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks
        ]);

        if (!permCheck.hasPermission) {
            const errorStr = ErrorHelper.permissionsError(permCheck.missing);
            if (interaction.deferred || interaction.replied) await interaction.editReply({ content: errorStr, components: [] });
            else await interaction.reply({ content: errorStr, ephemeral: true });
            return;
        }

        const priorityEmoji = priority === 'URGENTE' ? '🔴' : (priority === 'IMPORTANTE' ? '🟡' : '🟢');
        const channel = await guild.channels.create({ 
            name: `${priorityEmoji}-${type}-${user.username}`, 
            type: ChannelType.GuildText, 
            parent: config.categoryOpenId 
        });
        
        await channel.permissionOverwrites.set(overwrites);

        await setInitialPermissions(channel, user, staffRoles);

        const ticket = await Ticket.create({ userId: user.id, guildId: guild.id, channelId: channel.id, type, priority, metadata });
        await renderTicketDashboard(channel, ticket, config, typeConfig, user, staffRoles);

        const intelEmbed = await generateIntelligenceEmbed(guild, user.id);
        if (intelEmbed) await channel.send({ embeds: [intelEmbed] });

        const replyContent = `✅ Ticket creato: ${channel}`;
        if (interaction.deferred || interaction.replied) await interaction.editReply({ content: replyContent, components: [] });
        else await interaction.reply({ content: replyContent, ephemeral: true });

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

    const embed = new EmbedBuilder()
        .setTitle(`${typeConfig?.emoji || '🎫'} Ticket: ${ticket.type.toUpperCase()}`)
        .setDescription(`Bentornato <@${ticket.userId}>, lo staff ti assisterà a breve.\n\n**Metadati Sessione:**\n• Priorità: \`${ticket.priority}\`\n• Stato: \`${ticket.status}\``)
        .setColor(typeConfig?.color || '#3498db')
        .addFields(
            { name: '👤 Assegnato a', value: ticket.assignedStaffId ? `<@${ticket.assignedStaffId}>` : '_In attesa..._', inline: true },
            { name: '🏷️ Tag', value: ticket.tags.length > 0 ? ticket.tags.map(t => `\`${t}\``).join(' ') : '_Nessun tag_', inline: true }
        )
        .setTimestamp();

    if (typeConfig?.image) embed.setImage(typeConfig.image);

    const btnRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tk_claim').setLabel('Assumi').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️').setDisabled(!!ticket.assignedStaffId),
        new ButtonBuilder().setCustomId('tk_close').setLabel('Chiudi').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('tk_quick_reply').setLabel('Risposte Rapide').setStyle(ButtonStyle.Primary).setEmoji('📝')
    );

    const btnRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tk_tag').setLabel('Tagga').setStyle(ButtonStyle.Secondary).setEmoji('🏷️'),
        new ButtonBuilder().setCustomId('tk_transcript').setLabel('Logs').setStyle(ButtonStyle.Secondary).setEmoji('📄')
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
