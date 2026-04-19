import { EmbedBuilder, Events, MessageFlags } from 'discord.js';
import VerifyConfig from '../../../models/VerifyConfig.js';
import GlobalConfig from '../../../models/GlobalConfig.js';
import ErrorHelper from '../../../utils/errorHelper.js';
import logger from '../../../utils/logger.js';
import { t } from '../../../utils/translator.js';
import { replacePlaceholders } from '../../../utils/placeholderHelper.js';

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
                    content: '❌ ' + t(lang, 'verify.missing_roles'), 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // Check if user already has the role
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({ 
                    content: config.messages?.alreadyVerified || ('ℹ️ ' + t(lang, 'verify.already_verified')), 
                    flags: [MessageFlags.Ephemeral] 
                });
            }

            // Assign the new role
            await member.roles.add(role).catch(err => {
                logger.error(`[Verify] Failed to add role to ${user.tag}:`, err);
                const errorStr = ErrorHelper.roleHierarchyError(role.name);
                throw new Error(errorStr);
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

            // Send DM Notification
            if (config.dmEnabled) {
                const placeholders = {
                    user: user.username,
                    user_mention: user.toString(),
                    guild: guild.name,
                    member_count: guild.memberCount.toString()
                };

                const dmConfig = config.embeds?.dm || {};
                const dmEmbed = new EmbedBuilder()
                    .setTitle(replacePlaceholders(dmConfig.title || '✅ Verifica Completata', placeholders))
                    .setDescription(replacePlaceholders(dmConfig.description || 'Ti sei verificato correttamente!', placeholders))
                    .setColor(dmConfig.color || '#2ecc71')
                    .setTimestamp();
                
                if (dmConfig.footer) dmEmbed.setFooter({ text: replacePlaceholders(dmConfig.footer, placeholders) });
                if (dmConfig.thumbnail) dmEmbed.setThumbnail(replacePlaceholders(dmConfig.thumbnail, placeholders));
                if (dmConfig.image) dmEmbed.setImage(replacePlaceholders(dmConfig.image, placeholders));

                await user.send({ embeds: [dmEmbed] }).catch(() => {
                    logger.warn(`[Verify] Could not send DM to ${user.tag} (DMs closed)`);
                });
            }

            // Send Log
            if (config.logEnabled && config.logChannelId) {
                const logChannel = guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('👤 Utente Verificato')
                        .setColor('#2ecc71')
                        .setThumbnail(user.displayAvatarURL())
                        .addFields(
                            { name: '👤 Utente', value: `${user.tag} (${user.toString()})`, inline: true },
                            { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
                            { name: '📅 Account Creato', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                            { name: '✅ Ruolo Assegnato', value: `${role.toString()}`, inline: true }
                        )
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }

            const successMsg = config.messages?.successResponse || t(lang, 'verify.success_desc', { user: user.toString() });
            await interaction.reply({ 
                content: successMsg.includes('{user}') ? replacePlaceholders(successMsg, { user: user.toString() }) : (successMsg.startsWith('✅') ? successMsg : `✅ ${successMsg}`), 
                flags: [MessageFlags.Ephemeral] 
            });

            logger.info(`[Verify] User ${user.tag} verified successfully in ${guild.name}`);

        } catch (error) {
            logger.error('[Verify] Interaction Error:', error);
            const errLang = typeof lang !== 'undefined' ? lang : 'it';
            const errMsg = config?.messages?.errorResponse || t(errLang, 'general.error');
            await interaction.reply({ 
                content: errMsg.startsWith('❌') ? errMsg : `❌ ${errMsg} (${error.message})`, 
                flags: [MessageFlags.Ephemeral] 
            }).catch(() => {});
        }
    }
};
