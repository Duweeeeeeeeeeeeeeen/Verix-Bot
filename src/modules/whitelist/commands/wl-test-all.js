import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import { buildEmbed } from '../../../utils/embedHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName('wl-test-all')
        .setDescription('Mostra tutti gli embed di notifica whitelist configurati.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });

        if (!config || !config.embeds) {
            return interaction.reply({ content: '❌ Configurazione embeds non trovata.', flags: [MessageFlags.Ephemeral] });
        }

        const placeholders = {
            guild: interaction.guild.name,
            user: interaction.user.username,
            user_id: interaction.user.id,
            reason: 'Risposte troppo brevi e poco dettagliate (Esempio)',
            time_limit: config.timeLimit,
            total_questions: config.questions.length,
            current_index: 1,
            question: config.questions[0]?.text || 'Test question?',
            min_length: config.questions[0]?.minLength || 10,
            time_left: config.timeLimit,
            app_id: 'TEST_APP_ID_12345',
            staff: interaction.user.username
        };

        const types = [
            'start', 'question', 'error_min_length', 'timeout', 'review',
            'dm_submitted', 'dm_accepted', 'dm_rejected',
            'staff_received', 'staff_accepted', 'staff_rejected'
        ];

        // Send in chunks of 5 to avoid embed limits if necessary, 
        // but here we have 11, Discord allows 10 per message.
        // We'll split into 2 messages.

        await interaction.deferReply();

        const chunks = [];
        for (let i = 0; i < types.length; i += 5) {
            chunks.push(types.slice(i, i + 5));
        }

        for (let i = 0; i < chunks.length; i++) {
            const currentEmbeds = [];
            for (const type of chunks[i]) {
                const embed = buildEmbed(config.embeds[type], placeholders);
                if (embed) {
                    embed.setTitle(`[${type.toUpperCase()}] ${embed.data.title}`);
                    currentEmbeds.push(embed);
                }
            }

            if (currentEmbeds.length > 0) {
                if (i === 0) {
                    await interaction.editReply({ 
                        content: '📋 **Riepilogo Anteprime Embed Whitelist (Parte 1)**',
                        embeds: currentEmbeds 
                    });
                } else {
                    await interaction.followUp({ 
                        content: `📋 **Riepilogo Anteprime Embed Whitelist (Parte ${i + 1})**`,
                        embeds: currentEmbeds 
                    });
                }
            }
        }
    },
};
