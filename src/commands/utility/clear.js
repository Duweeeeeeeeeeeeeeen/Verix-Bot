import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import UtilityConfig from '../../models/UtilityConfig.js';
import GlobalConfig from '../../models/GlobalConfig.js';
import logger from '../../utils/logger.js';
import messageService from '../../utils/messageService.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina un numero specificato di messaggi.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Numero di messaggi da eliminare (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Filtra i messaggi di un utente specifico'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('target');
        const channel = interaction.channel;

        // Fetch configs
        const [utilConfig, globalConfig] = await Promise.all([
            UtilityConfig.findOne({ guildId: interaction.guildId }),
            GlobalConfig.findOne({ guildId: interaction.guildId })
        ]);

        // Check if module is enabled
        if (utilConfig && utilConfig.enabled === false) {
            return messageService.reply(interaction, 'system', 'module_disabled', { module: 'Utility' }, { ephemeral: true });
        }

        // Permission check: Admin or Allowed Roles
        const member = interaction.member;
        const isUserAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const adminRoles = globalConfig?.adminRoles || [];
        const allowedRoles = utilConfig?.allowedRoles || [];
        const allAllowedRoles = [...adminRoles, ...allowedRoles];

        const hasPermission = isUserAdmin || member.roles.cache.some(role => allAllowedRoles.includes(role.id));

        if (!hasPermission) {
            return messageService.reply(interaction, 'system', 'no_permission', {}, { ephemeral: true });
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            let messages = await channel.messages.fetch({ limit: amount });

            if (target) {
                messages = messages.filter(m => m.author.id === target.id);
            }

            if (messages.size === 0) {
                return messageService.reply(interaction, 'utility', 'clear_no_messages', {}, { ephemeral: true });
            }

            const deleted = await channel.bulkDelete(messages, true);

            await messageService.reply(interaction, 'utility', 'clear_success', { amount: deleted.size }, { ephemeral: true });

            logger.info(`Guild ${interaction.guildId}: User ${interaction.user.tag} cleared ${deleted.size} messages in #${channel.name}`);
        } catch (error) {
            logger.error(`Error in clear command: ${error.message}`);
            await messageService.reply(interaction, 'utility', 'clear_error', {}, { ephemeral: true });
        }
    },
};
