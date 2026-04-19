import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';

export default {
    data: new SlashCommandBuilder()
        .setName('wl-questions')
        .setDescription('Gestisci le domande della whitelist.')
        .addSubcommand(sub => 
            sub.setName('add')
                .setDescription('Aggiungi una domanda')
                .addStringOption(opt => opt.setName('text').setDescription('Testo della domanda').setRequired(true))
                .addIntegerOption(opt => opt.setName('min_length').setDescription('Lunghezza minima risposta').setRequired(false)))
        .addSubcommand(sub => 
            sub.setName('remove')
                .setDescription('Rimuovi una domanda')
                .addIntegerOption(opt => opt.setName('index').setDescription('Indice della domanda (usa /wl-questions list)').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('list')
                .setDescription('Mostra tutte le domande attuali'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });

        if (!config) {
            return interaction.reply({ content: 'Esegui prima `/setup-wl` per configurare il sistema.', ephemeral: true });
        }

        if (subcommand === 'list') {
            if (config.questions.length === 0) {
                return interaction.reply({ content: 'Non ci sono domande configurate.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('📋 Domande Whitelist')
                .setColor('#5865F2')
                .setDescription(config.questions.map((q, i) => `**${i + 1}.** ${q.text} *(Min: ${q.minLength})*`).join('\n'));

            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === 'add') {
            const text = interaction.options.getString('text');
            const minLength = interaction.options.getInteger('min_length') || 10;

            config.questions.push({ text, minLength });
            await config.save();

            return interaction.reply({ content: `✅ Domanda aggiunta: "${text}"` });
        }

        if (subcommand === 'remove') {
            const index = interaction.options.getInteger('index') - 1;

            if (index < 0 || index >= config.questions.length) {
                return interaction.reply({ content: 'Indice non valido.', ephemeral: true });
            }

            const removed = config.questions.splice(index, 1);
            await config.save();

            return interaction.reply({ content: `🗑️ Domanda rimossa: "${removed[0].text}"` });
        }
    },
};
