import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import WhitelistAudit from '../../../models/WhitelistAudit.js';
import logger from '../../../utils/logger.js';

/**
 * Generates the Voice Whitelist Dashboard Embed and Components.
 */
export async function getDashboard(guildId) {
    const config = await WhitelistConfig.findOne({ guildId });
    if (!config) return null;

    const activeSessions = await VoiceQueue.find({ guildId, status: 'ACTIVE' }).sort({ joinedAt: 1 });
    const waitingQueue = await VoiceQueue.find({ guildId, status: 'WAITING' }).sort({ joinedAt: 1 });
    const recentAudits = await WhitelistAudit.find({ guildId, type: 'VOICE' }).sort({ timestamp: -1 }).limit(config.voiceSettings.recentActionsCount || 3);

    const status = config.voiceSettings.paused ? 'Paused' : 'Active';
    const color = config.voiceSettings.paused ? '#ff4757' : '#2ecc71';

    const embed = new EmbedBuilder()
        .setTitle('Voice Whitelist Control Center')
        .setDescription(`**Status**: ${status}\n**Rooms**: \`${activeSessions.length} / ${config.voiceSettings.maxConcurrent}\` | **Queue**: \`${waitingQueue.length}\``)
        .setColor(color)
        .setTimestamp();

    // Active Sessions
    if (activeSessions.length > 0) {
        const sessionList = activeSessions.map((s, i) => {
            const time = s.staffJoinedAt ? `<t:${Math.floor(s.staffJoinedAt.getTime() / 1000)}:R>` : 'Waiting for staff';
            return `**${i + 1}.** <@${s.userId}> | Staff: ${s.staffId ? `<@${s.staffId}>` : 'None'} | *${time}*`;
        }).join('\n');
        embed.addFields({ name: `Active Sessions`, value: sessionList || 'None', inline: false });
    }

    // Queue
    if (waitingQueue.length > 0) {
        const queueList = waitingQueue.slice(0, 5).map((s, i) => {
            return `**#${i + 1}.** <@${s.userId}> ${s.isVip ? 'VIP' : ''}`;
        }).join('\n');
        embed.addFields({ name: `Next in Queue`, value: queueList || 'None', inline: true });
    }

    // Recent Activity
    if (recentAudits.length > 0) {
        const history = recentAudits.map(a => {
            const icon = a.action === 'ACCEPTED' ? 'OK' : 'NO';
            return `${icon} <@${a.userId}> by <@${a.staffId}> (<t:${Math.floor(a.timestamp.getTime() / 1000)}:R>)`;
        }).join('\n');
        embed.addFields({ name: 'Recent Actions', value: history || 'None', inline: false });
    }

    const rows = [];

    // Row 1: Dashboard Controls
    const btnRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('dashboard_refresh')
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(config.voiceSettings.paused ? 'dashboard_resume' : 'dashboard_pause')
            .setLabel(config.voiceSettings.paused ? 'Resume' : 'Pause')
            .setStyle(config.voiceSettings.paused ? ButtonStyle.Success : ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('dashboard_skip')
            .setLabel('Skip Next')
            .setStyle(ButtonStyle.Primary)
    );
    rows.push(btnRow);

    // Row 2: Queue Selector (Move to Top)
    if (waitingQueue.length > 0) {
        const selector = new StringSelectMenuBuilder()
            .setCustomId('promote_user_to_top')
            .setPlaceholder('Move a user to the front of the queue...')
            .addOptions(waitingQueue.slice(0, 25).map(s => ({
                label: `Move to front: User ${s.userId}`, // We can't fetch username easily here, but we'll use ID
                value: s.userId
            })));
        
        rows.push(new ActionRowBuilder().addComponents(selector));
    }

    return { embeds: [embed], components: rows };
}

/**
 * Updates the existing dashboard message or cleans up if deleted.
 */
export async function updateDashboard(guild, client) {
    try {
        const config = await WhitelistConfig.findOne({ guildId: guild.id });
        if (!config || !config.voiceSettings.dashboardMsgId || !config.voiceSettings.dashboardChannelId) return;

        const channel = guild.channels.cache.get(config.voiceSettings.dashboardChannelId);
        if (!channel) return;

        const { embeds, components } = await getDashboard(guild.id);
        
        const message = await channel.messages.fetch(config.voiceSettings.dashboardMsgId).catch(() => null);
        if (message) {
            await message.edit({ embeds, components });
        }
    } catch (error) {
        logger.error('Error updating Voice Dashboard:', error);
    }
}
