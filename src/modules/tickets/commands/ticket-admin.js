import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import TicketConfig from '../../../models/TicketConfig.js';
import logger from '../../../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket-admin')
        .setDescription('🛠️ Amministrazione avanzata del sistema ticket.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        // Canned Responses
        .addSubcommandGroup(group =>
            group.setName('templates')
                .setDescription('Gestisci le risposte rapide per lo staff')
                .addSubcommand(sub =>
                    sub.setName('add')
                        .setDescription('Aggiungi una risposta rapida')
                        .addStringOption(opt => opt.setName('label').setDescription('Nome breve del template').setRequired(true))
                        .addStringOption(opt => opt.setName('content').setDescription('Messaggio da inviare').setRequired(true))
                )
                .addSubcommand(sub =>
                    sub.setName('remove')
                        .setDescription('Rimuovi una risposta rapida')
                        .addStringOption(opt => opt.setName('label').setDescription('Nome del template da rimuovere').setRequired(true))
                )
        )
        // Ticket Types
        .addSubcommandGroup(group =>
            group.setName('types')
                .setDescription('Gestisci i tipi di ticket disponibili')
                .addSubcommand(sub =>
                    sub.setName('add')
                        .setDescription('Aggiungi un nuovo tipo di ticket')
                        .addStringOption(opt => opt.setName('id').setDescription('ID univoco (es: donazioni)').setRequired(true))
                        .addStringOption(opt => opt.setName('emoji').setDescription('Emoji per il pulsante/menu').setRequired(true))
                        .addStringOption(opt => opt.setName('color').setDescription('Codice HEX colore (es: #ff0000)').setRequired(true))
                )
                .addSubcommand(sub =>
                    sub.setName('remove')
                        .setDescription('Rimuovi un tipo di ticket')
                        .addStringOption(opt => opt.setName('id').setDescription('ID del tipo da rimuovere').setRequired(true))
                )
        )
        // Branding
        .addSubcommand(sub =>
            sub.setName('set-image')
                .setDescription('Imposta il banner del pannello ticket')
                .addStringOption(opt => opt.setName('url').setDescription('URL dell\'immagine').setRequired(true))
        ),
    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        const config = await TicketConfig.findOne({ guildId }) || await TicketConfig.create({ guildId });

        // --- Templates Management ---
        if (group === 'templates') {
            const label = interaction.options.getString('label');
            const content = interaction.options.getString('content');

            if (subcommand === 'add') {
                config.cannedResponses.push({ label, content });
                await config.save();
                return interaction.reply({ content: `✅ Risposta rapida \`${label}\` aggiunta correttamente.`, ephemeral: true });
            }

            if (subcommand === 'remove') {
                config.cannedResponses = config.cannedResponses.filter(r => r.label !== label);
                await config.save();
                return interaction.reply({ content: `✅ Risposta rapida \`${label}\` rimossa.`, ephemeral: true });
            }
        }

        // --- Types Management ---
        if (group === 'types') {
            const id = interaction.options.getString('id').toLowerCase();
            const emoji = interaction.options.getString('emoji');
            const color = interaction.options.getString('color');

            if (subcommand === 'add') {
                config.typesConfig.set(id, { emoji, color });
                if (!config.enabledTypes.includes(id)) config.enabledTypes.push(id);
                await config.save();
                return interaction.reply({ content: `✅ Nuovo tipo di ticket \`${id}\` creato. Usa \`/setup-tickets\` per aggiornare il pannello.`, ephemeral: true });
            }

            if (subcommand === 'remove') {
                config.typesConfig.delete(id);
                config.enabledTypes = config.enabledTypes.filter(t => t !== id);
                await config.save();
                return interaction.reply({ content: `✅ Tipo di ticket \`${id}\` rimosso.`, ephemeral: true });
            }
        }

        // --- Branding Management ---
        if (subcommand === 'set-image') {
            const url = interaction.options.getString('url');
            config.panelImage = url;
            await config.save();
            return interaction.reply({ content: `🖼️ Banner del pannello aggiornato con successo.`, ephemeral: true });
        }
    },
};
