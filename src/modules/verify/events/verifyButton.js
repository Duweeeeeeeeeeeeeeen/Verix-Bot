import { Events, MessageFlags } from 'discord.js';
import VerifyConfig from '../../../models/VerifyConfig.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import { t } from '../../../utils/translator.js';
import { replacePlaceholders } from '../../../utils/placeholderHelper.js';
import { sendUserNotification } from '../../../utils/notificationService.js';
import messageService from '../../../utils/messageService.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'verify_user') return;

        const { guild, member, user } = interaction;
        
        try {
            // Priority fetch (already cached in most cases)
            const config = await VerifyConfig.findOne({ guildId: guild.id });
            if (!config || !config.enabled) return;

            const globalConfig = await GlobalConfig.findOne({ guildId: guild.id });
            const lang = globalConfig?.language || 'it';

            const role = guild.roles.cache.get(config.roleId);
            if (!role) {
                return interaction.reply({ 
                    content: '❌ ' + t(lang, 'verify.role_not_found'), 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // Check if user already has the role
            if (member.roles.cache.has(role.id)) {
                const embed = await messageService.get(guild.id, 'verify', 'already_verified', {
                    guild: guild.name
                });
                return interaction.reply({ 
                    embeds: [embed], 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // Assign the new role
            await member.roles.add(role).catch(async err => {
                logger.error(`[Verify] Failed to add role to ${user.tag}:`, err);
                const errorEmbed = await ErrorHelper.roleHierarchyError(guild.id, role.name);
                await interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
                throw new Error('STOP_EXECUTION'); // Prevent further logic
            });

            // Remove old role if configured
            if (config.removeRoleId) {
                const oldRole = guild.roles.cache.get(config.removeRoleId);
                if (oldRole && member.roles.cache.has(oldRole.id)) {
                    await member.roles.remove(oldRole).catch(err => {
                        logger.warn(`[Verify] Failed to remove old role from ${user.tag}:`, err);
                    });
                }
            }

            // Notification Notification
            const verifySuccessEmbed = await messageService.get(guild.id, 'verify', 'success', {
                user: user.username,
                user_mention: user.toString(),
                guild: guild.name,
                member_count: guild.memberCount.toString()
            });

            if (verifySuccessEmbed) {
                await sendUserNotification(guild, user, config.notifications, { embeds: [verifySuccessEmbed] });
            }

            // Send Log
            if (config.logEnabled && config.logChannelId) {
                const logChannel = guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    const logEmbed = await messageService.get(guild.id, 'verify', 'staff_log', {
                        user: `${user.tag} (${user.toString()})`,
                        userId: user.id,
                        role: role.toString()
                    });
                    if (logEmbed) {
                        logEmbed.setThumbnail(user.displayAvatarURL());
                        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                    }
                }
            }

            const successEmbed = await messageService.get(guild.id, 'verify', 'success_reply', {
                user: user.toString(),
                guild: guild.name
            });

            await interaction.reply({ 
                embeds: [successEmbed], 
                flags: [MessageFlags.Ephemeral] 
            });

            logger.info(`[Verify] User ${user.tag} verified successfully in ${guild.name}`);

        } catch (error) {
            logger.error('[Verify] Interaction Error:', error);
            const errLang = typeof lang !== 'undefined' ? lang : 'it';
            const errMsg = config?.messages?.errorResponse || t(errLang, 'general.error');
            await messageService.reply(interaction, 'verify', 'error', {}, { ephemeral: true }).catch(() => {});
        }
    }
};
