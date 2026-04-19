import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import { buildEmbed } from '../../../utils/embedHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('wl-test-embed')
        .setDescription('Testa l\'anteprima di un embed whitelist.')
        .addStringOption(opt => 
            opt.setName('type')
               .setDescription('Il tipo di embed da testare')
               .setRequired(true)
               .addChoices(
                   { name: 'Start', value: 'start' },
                   { name: 'Question', value: 'question' },
                   { name: 'Error Length', value: 'error_min_length' },
                   { name: 'Timeout', value: 'timeout' },
                   { name: 'Review', value: 'review' },
                   { name: 'DM Submitted', value: 'dm_submitted' },
                   { name: 'DM Accepted', value: 'dm_accepted' },
                   { name: 'DM Rejected', value: 'dm_rejected' },
                   { name: 'Staff Received', value: 'staff_received' },
                   { name: 'Staff Accepted', value: 'staff_accepted' },
                   { name: 'Staff Rejected', value: 'staff_rejected' }
               )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });

        if (!config || !config.embeds || !config.embeds[type]) {
            return interaction.reply({ content: '❌ Configurazione non trovata per questo tipo di embed.', ephemeral: true });
        }

        const placeholders = {
            guild: interaction.guild.name,
            user: interaction.user.username,
            user_id: interaction.user.id,
            reason: 'Esempio di motivo per il test dell\'embed.',
            time_limit: config.timeLimit,
            total_questions: config.questions.length,
            current_index: 1,
            question: config.questions[0]?.text || 'Esempio domanda?',
            min_length: config.questions[0]?.minLength || 10,
            time_left: config.timeLimit,
            app_id: 'APP_123456789',
            staff: interaction.user.username
        };

        const embed = buildEmbed(config.embeds[type], placeholders);

        if (!embed) {
            return interaction.reply({ content: `⚠️ L'embed **${type}** è attualmente disabilitato o non configurato.`, ephemeral: true });
        }

        await interaction.reply({ 
            content: `🔍 **Anteprima Embed: ${type.toUpperCase()}**`,
            embeds: [embed] 
        });
    },
};
