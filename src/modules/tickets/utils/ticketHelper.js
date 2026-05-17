import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import WhitelistApp from '../../../models/WhitelistApp.js';
import Background from '../../../models/Background.js';
import Ticket from '../../../models/Ticket.js';

/**
 * Genera una trascrizione testuale dei messaggi in un canale.
 * @param {TextChannel} channel 
 * @param {Object} ticketData - Documento del ticket dal DB
 * @returns {AttachmentBuilder}
 */
export async function generateTranscription(channel, ticketData = {}) {
    const messages = await channel.messages.fetch({ limit: 100 });
    
    let transcript = `==================================================\n`;
    transcript += `      PROFESSIONAL TICKET TRANSCRIPTION\n`;
    transcript += `==================================================\n`;
    transcript += `Ticket ID: ${channel.name}\n`;
    transcript += `Type: ${ticketData.type || 'N/A'}\n`;
    transcript += `Priority: ${ticketData.priority || 'NORMAL'}\n`;
    transcript += `User: ${channel.guild.members.cache.get(ticketData.userId)?.user?.tag || ticketData.userId}\n`;
    transcript += `Assigned Staff: ${ticketData.assignedStaffId || 'Unassigned'}\n`;
    transcript += `Opened: ${ticketData.openedAt?.toLocaleString() || new Date().toLocaleString()}\n`;
    transcript += `Generated at: ${new Date().toLocaleString()}\n`;
    transcript += `==================================================\n\n`;

    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    
    sortedMessages.forEach(msg => {
        const time = new Date(msg.createdTimestamp).toLocaleTimeString();
        transcript += `[${time}] ${msg.author.tag}: ${msg.content}\n`;
        if (msg.attachments.size > 0) {
            msg.attachments.forEach(att => {
                transcript += `   > [Attachment] ${att.url}\n`;
            });
        }
    });

    transcript += `\n==================================================\n`;
    transcript += `            END OF TRANSCRIPTION\n`;
    transcript += `==================================================\n`;

    const buffer = Buffer.from(transcript, 'utf-8');
    return new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` });
}

import { t } from '../../../locales/t.js';
import Guild from '../../../models/Guild.js';
import GlobalConfig from '../../../models/GlobalConfig.js';

/**
 * Genera l'embed di "Intelligence" per lo staff.
 * @param {Guild} guild 
 * @param {string} userId 
 * @returns {EmbedBuilder}
 */
export async function generateIntelligenceEmbed(guild, userId) {
    const user = await guild.client.users.fetch(userId).catch(() => null);
    
    // Fetch DB configs
    const guildData = await Guild.findOne({ guildId: guild.id });
    const globalConfig = await GlobalConfig.findOne({ guildId: guild.id });
    const lang = globalConfig?.language || 'en';
    
    const enabledModules = guildData?.enabledModules || [];
    
    const previousTickets = await Ticket.countDocuments({ userId, guildId: guild.id, status: 'CLOSED' });

    const embed = new EmbedBuilder()
        .setTitle(t('tickets.intelligence.title', lang, { user: user?.tag || userId }))
        .setColor('#2f3136')
        .setThumbnail(user?.displayAvatarURL())
        .addFields({ 
            name: t('tickets.intelligence.prev_tickets', lang), 
            value: t('tickets.intelligence.sessions_closed', lang, { count: previousTickets }), 
            inline: true 
        });

    if (enabledModules.includes('whitelist')) {
        const wlApp = await WhitelistApp.findOne({ userId, guildId: guild.id }).sort({ createdAt: -1 });
        embed.addFields({ 
            name: t('tickets.intelligence.whitelist', lang), 
            value: wlApp ? t('tickets.intelligence.status', lang, { status: wlApp.status }) : t('tickets.intelligence.no_app', lang), 
            inline: true 
        });
        if (wlApp) {
            embed.addFields({ 
                name: t('tickets.intelligence.last_wl', lang), 
                value: wlApp.submittedAt ? wlApp.submittedAt.toLocaleDateString() : 'N/A', 
                inline: true 
            });
        }
    }

    if (enabledModules.includes('background')) {
        const bgApp = await Background.findOne({ userId, guildId: guild.id }).sort({ createdAt: -1 });
        embed.addFields({ 
            name: t('tickets.intelligence.background', lang), 
            value: bgApp ? t('tickets.intelligence.status', lang, { status: bgApp.status }) : t('tickets.intelligence.no_dossier', lang), 
            inline: true 
        });
    }

    embed.setFooter({ text: t('tickets.intelligence.footer', lang) });

    return embed;
}

/**
 * Aggiorna il timestamp dell'ultima attività.
 * @param {string} channelId 
 */
export async function updateLastActivity(channelId) {
    await Ticket.updateOne({ channelId }, { $set: { lastActivityAt: new Date() } });
}

/**
 * Imposta i permessi base per un nuovo ticket.
 * @param {TextChannel} channel 
 * @param {User} user 
 * @param {Array<Role>} staffRoles 
 */
export async function setInitialPermissions(channel, user, staffRoles = []) {
    const overwrites = [
        {
            id: channel.guild.id,
            deny: ['ViewChannel'],
        },
        {
            id: user.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles'],
        }
    ];

    staffRoles.forEach(role => {
        if (role) {
            overwrites.push({
                id: role.id,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'ManageMessages'],
            });
        }
    });

    await channel.permissionOverwrites.set(overwrites);
}
