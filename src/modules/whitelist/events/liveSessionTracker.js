import { Events, EmbedBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import VoiceQueue from '../../../models/VoiceQueue.js';
import { updateDashboard } from '../utils/voiceDashboard.js';
import logger from '../../../utils/logger.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import { t } from '../../../locales/t.js';

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState, client) {
        const { member, guild, channel } = newState;
        if (member.user.bot) return;

        // Check if it's a staff member joining a WL channel
        if (!channel || !channel.name.startsWith('wl-')) return;

        const config = await WhitelistConfig.findOne({ guildId: guild.id });
        if (!config || !config.staffRoleIds || config.staffRoleIds.length === 0) return;

        // Verify if member has ANY of the staff roles
        if (!member.roles.cache.some(role => config.staffRoleIds.includes(role.id))) return;

        try {
            const session = await VoiceQueue.findOne({ voiceChannelId: channel.id, status: 'ACTIVE' });
            if (!session || session.staffJoinedAt) return; // Already tracked or not a managed session

            // Update session tracking
            session.staffId = member.id;
            session.staffJoinedAt = new Date();
            await session.save();

            // Find the staff log message and update it
            if (config.logChannelId) {
                const globalConfig = await GlobalConfig.findOne({ guildId: guild.id });
                const lang = globalConfig?.language || 'en';
                const logChannel = guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    // We need to find the specific message. 
                    // Usually it's the most recent one for this user/channel.
                    const messages = await logChannel.messages.fetch({ limit: 20 });
                    const targetMsg = messages.find(m => m.embeds[0]?.description?.includes(channel.name) && m.author.id === client.user.id);

                    if (targetMsg) {
                        const oldEmbed = targetMsg.embeds[0];
                        const newEmbed = EmbedBuilder.from(oldEmbed)
                            .setColor('#3498db')
                            .addFields([
                                { name: `Staff - ${t('whitelist.voice_staff_present', lang)}`, value: `${member}`, inline: true },
                                { name: `Time - ${t('common.start_time', lang)}`, value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                            ]);

                        await targetMsg.edit({ embeds: [newEmbed] });
                    }
                }
            }
            await updateDashboard(guild, client);
        } catch (error) {
            logger.error('Error tracking live voice session:', error);
        }
    },
};
