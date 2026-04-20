import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import UtilityConfig from '../../models/UtilityConfig.js';
import GlobalConfig from '../../models/GlobalConfig.js';
import logger from '../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Elimina un numero specificato di messaggi.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Numero di messaggi da eliminare (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMax(100))
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
            return interaction.reply({ content: '❌ Il modulo Utility è disabilitato in questo server.', ephemeral: true });
        }

        // Permission check: Admin or Allowed Roles
        const member = interaction.member;
        const isUserAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const adminRoles = globalConfig?.adminRoles || [];
        const allowedRoles = utilConfig?.allowedRoles || [];
        const allAllowedRoles = [...adminRoles, ...allowedRoles];

        const hasPermission = isUserAdmin || member.roles.cache.some(role => allAllowedRoles.includes(role.id));

        if (!hasPermission) {
            return interaction.reply({ content: '❌ Non hai i permessi necessari per usare questo comando.', ephemeral: true });
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            let messages = await channel.messages.fetch({ limit: amount });

            if (target) {
                messages = messages.filter(m => m.author.id === target.id);
            }

            if (messages.size === 0) {
                return interaction.editReply({ content: `Non ho trovato messaggi${target ? ` di ${target.username}` : ''} da eliminare.` });
            }

            const deleted = await channel.bulkDelete(messages, true);

            const embed = new EmbedBuilder()
                .setTitle('🧹 Pulizia Completata')
                .setDescription(`Ho eliminato **${deleted.size}** messaggi${target ? ` di ${target.username}` : ''}.`)
                .setColor('#2ecc71')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            logger.info(`Guild ${interaction.guildId}: User ${interaction.user.tag} cleared ${deleted.size} messages in #${channel.name}`);
        } catch (error) {
            logger.error(`Error in clear command: ${error.message}`);
            if (interaction.deferred) {
                await interaction.editReply({ content: 'Si è verificato un errore durante l\'eliminazione dei messaggi. Assicurati che i messaggi non siano più vecchi di 14 giorni.' });
            } else {
                await interaction.reply({ content: 'Si è verificato un errore durante l\'eliminazione dei messaggi.', ephemeral: true });
            }
        }
    },
};
