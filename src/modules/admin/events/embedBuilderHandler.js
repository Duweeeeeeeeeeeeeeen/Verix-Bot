import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, MessageFlags, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import BackgroundConfig from '../../../models/BackgroundConfig.js';
import { buildEmbed } from '../../../utils/embedHelper.js';

// Configuration of available embed keys for each module
const MODULE_KEYS = {
    whitelist: [
        { label: 'Inizio (Start)', value: 'start' },
        { label: 'Domanda (Question)', value: 'question' },
        { label: 'Riepilogo (Review)', value: 'review' },
        { label: 'Esito: Accettato (DM)', value: 'dm_accepted' },
        { label: 'Esito: Rifiutato (DM)', value: 'dm_rejected' },
        { label: 'Log Staff (Received)', value: 'staff_received' }
    ],
    background: [
        { label: 'Pannello (Panel)', value: 'panel' },
        { label: 'Istruzioni (Instructions)', value: 'instructions' },
        { label: 'Esito: Accettato (DM)', value: 'dm_accepted' },
        { label: 'Esito: Rifiutato (DM)', value: 'dm_rejected' },
        { label: 'Log Staff (Received)', value: 'staff_received' }
    ]
};

// Dummy data for preview placeholders
const PREVIEW_DATA = {
    user: 'Mario Rossi',
    user_id: '123456789',
    guild: 'Empire RP',
    question: 'Qual è il background del tuo personaggio?',
    answer: 'Il mio personaggio è un ex detective...',
    reason: 'Risposte non dettagliate.',
    time_left: '25',
    total_questions: '10',
    current_index: '2',
    min_length: '100',
    app_id: 'WL-999',
    staff: 'AdminStaff',
    bg_link: 'https://docs.google.com/doc',
    bg_desc: 'Storia di un fuorilegge...',
    bg_attachment: 'https://example.com/file.png'
};

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.guild) return;

        // --- 1. Module Selection ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'eb_select_module') {
            const moduleName = interaction.values[0];
            const options = MODULE_KEYS[moduleName];

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`eb_select_key_${moduleName}`)
                    .setPlaceholder(`Seleziona l'embed di ${moduleName.toUpperCase()} da modificare...`)
                    .addOptions(options)
            );

            return interaction.update({
                content: `📁 **Modulo Selezionato:** \`${moduleName.toUpperCase()}\`\nScegli quale embed specifico vuoi personalizzare.`,
                components: [row]
            });
        }

        // --- 2. Key Selection (Initialize Editor) ---
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('eb_select_key_')) {
            const moduleName = interaction.customId.split('_')[3];
            const embedKey = interaction.values[0];

            return renderEditor(interaction, moduleName, embedKey);
        }

        // --- 3. Property Buttons (Open Modals) ---
        if (interaction.isButton() && interaction.customId.startsWith('eb_edit_')) {
            const [,, property, moduleName, embedKey] = interaction.customId.split('_');
            
            const config = moduleName === 'whitelist' 
                ? await WhitelistConfig.findOne({ guildId: interaction.guild.id })
                : await BackgroundConfig.findOne({ guildId: interaction.guild.id });

            const embedConfig = config.embeds[embedKey];

            if (property === 'addfield') {
                const modal = new ModalBuilder()
                    .setCustomId(`eb_modal_addfield_${moduleName}_${embedKey}`)
                    .setTitle('Aggiungi Campo');

                const nameInput = new TextInputBuilder()
                    .setCustomId('field_name')
                    .setLabel('Nome del Campo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const valueInput = new TextInputBuilder()
                    .setCustomId('field_value')
                    .setLabel('Valore del Campo')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const inlineInput = new TextInputBuilder()
                    .setCustomId('field_inline')
                    .setLabel('Inline? (si/no)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('si o no')
                    .setRequired(false);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nameInput),
                    new ActionRowBuilder().addComponents(valueInput),
                    new ActionRowBuilder().addComponents(inlineInput)
                );
                return interaction.showModal(modal);
            }

            if (property === 'clearfields') {
                await config.updateOne({ $set: { [`embeds.${embedKey}.fields`]: [] } });
                await interaction.reply({ content: '🗑️ Tutti i campi sono stati rimossi.', flags: [MessageFlags.Ephemeral] });
                return renderEditor(interaction, moduleName, embedKey);
            }

            const modal = new ModalBuilder()
                .setCustomId(`eb_modal_${property}_${moduleName}_${embedKey}`)
                .setTitle(`Modifica ${property.toUpperCase()}`);

            const input = new TextInputBuilder()
                .setCustomId('new_value')
                .setLabel(`Inserisci nuovo valore per ${property}`)
                .setStyle(property === 'description' ? TextInputStyle.Paragraph : TextInputStyle.Short)
                .setValue(embedConfig[property] || '')
                .setRequired(false);

            modal.addComponents(new ActionRowBuilder().addComponents(input));
            return interaction.showModal(modal);
        }

        // --- 4. Modal Submissions (Save & Re-render) ---
        if (interaction.isModalSubmit() && interaction.customId.startsWith('eb_modal_')) {
            const parts = interaction.customId.split('_');
            const property = parts[2];
            const moduleName = parts[3];
            const embedKey = parts[4];

            let config = moduleName === 'whitelist' 
                ? await WhitelistConfig.findOne({ guildId: interaction.guild.id })
                : await BackgroundConfig.findOne({ guildId: interaction.guild.id });

            // Specific handling for complex properties
            if (property === 'addfield') {
                const name = interaction.fields.getTextInputValue('field_name');
                const value = interaction.fields.getTextInputValue('field_value');
                const inline = interaction.fields.getTextInputValue('field_inline').toLowerCase() === 'si';

                await config.updateOne({ 
                    $push: { [`embeds.${embedKey}.fields`]: { name, value, inline } } 
                });
            } else {
                const newValue = interaction.fields.getTextInputValue('new_value');
                const updatePath = `embeds.${embedKey}.${property}`;
                await config.updateOne({ $set: { [updatePath]: newValue } });
            }

            await interaction.deferUpdate();
            return renderEditor(interaction, moduleName, embedKey);
        }

        // --- 5. Done / Reset Buttons ---
        if (interaction.isButton() && (interaction.customId.startsWith('eb_done_') || interaction.customId.startsWith('eb_reset_'))) {
            const parts = interaction.customId.split('_');
            const action = parts[1];
            const moduleName = parts[2];
            const embedKey = parts[3];

            if (action === 'done') {
                return interaction.update({ content: '✅ **Configurazione completata.** L\'editor è stato chiuso.', embeds: [], components: [] });
            }

            if (action === 'reset') {
                let config = moduleName === 'whitelist' 
                    ? await WhitelistConfig.findOne({ guildId: interaction.guild.id })
                    : await BackgroundConfig.findOne({ guildId: interaction.guild.id });

                // Simple reset: set to null/empty and let the model defaults or fallbacks take over
                const properties = ['title', 'description', 'color', 'image', 'thumbnail', 'footer'];
                const resetData = {};
                properties.forEach(p => resetData[`embeds.${embedKey}.${p}`] = undefined); // mongoose will use defaults on next save/load if undefined or we can set specific defaults

                await config.updateOne({ $unset: resetData });
                
                await interaction.followUp({ content: '🔄 Embed ripristinato ai valori predefiniti.', flags: [MessageFlags.Ephemeral] });
                return renderEditor(interaction, moduleName, embedKey);
            }
        }
    }
};

/**
 * Renders the interactive editor message
 */
async function renderEditor(interaction, moduleName, embedKey, config = null) {
    if (!config) {
        config = moduleName === 'whitelist' 
            ? await WhitelistConfig.findOne({ guildId: interaction.guild.id })
            : await BackgroundConfig.findOne({ guildId: interaction.guild.id });
    }

    const embedConfig = config.embeds[embedKey];
    const previewEmbed = buildEmbed(embedConfig, PREVIEW_DATA, config);

    const btnRow1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`eb_edit_title_${moduleName}_${embedKey}`).setLabel('Titolo').setStyle(ButtonStyle.Secondary).setEmoji('✏️'),
        new ButtonBuilder().setCustomId(`eb_edit_description_${moduleName}_${embedKey}`).setLabel('Descrizione').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
        new ButtonBuilder().setCustomId(`eb_edit_color_${moduleName}_${embedKey}`).setLabel('Colore').setStyle(ButtonStyle.Secondary).setEmoji('🎨'),
        new ButtonBuilder().setCustomId(`eb_edit_footer_${moduleName}_${embedKey}`).setLabel('Footer').setStyle(ButtonStyle.Secondary).setEmoji('🦶')
    );

    const btnRow2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`eb_edit_image_${moduleName}_${embedKey}`).setLabel('Banner URL').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
        new ButtonBuilder().setCustomId(`eb_edit_thumbnail_${moduleName}_${embedKey}`).setLabel('Thumb URL').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
        new ButtonBuilder().setCustomId(`eb_edit_addfield_${moduleName}_${embedKey}`).setLabel('+ Campo').setStyle(ButtonStyle.Primary).setEmoji('➕'),
        new ButtonBuilder().setCustomId(`eb_edit_clearfields_${moduleName}_${embedKey}`).setLabel('Pulisci Campi').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    );

    const btnRow3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`eb_reset_${moduleName}_${embedKey}`).setLabel('Reset').setStyle(ButtonStyle.Danger).setEmoji('🔄'),
        new ButtonBuilder().setCustomId(`eb_done_${moduleName}_${embedKey}`).setLabel('Chiudi').setStyle(ButtonStyle.Success).setEmoji('✅')
    );

    const content = `🛠️ **Editor Visuale:** \`${moduleName.toUpperCase()} / ${embedKey}\`\nUsa i pulsanti sotto per modificare i valori. L'anteprima si aggiornerà ad ogni modifica.`;

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        return interaction.update({ content, embeds: [previewEmbed], components: [btnRow1, btnRow2, btnRow3] });
    } else {
        return interaction.editReply({ content, embeds: [previewEmbed], components: [btnRow1, btnRow2, btnRow3] });
    }
}
