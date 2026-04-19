import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('embed-builder')
        .setDescription('🛠️ Editor Visuale degli Embed (Solo Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('eb_select_module')
                .setPlaceholder('Scegli il modulo da modificare...')
                .addOptions([
                    { label: 'Whitelist 🛂', value: 'whitelist', description: 'Gestisci gli embed del sistema whitelist' },
                    { label: 'Background 📖', value: 'background', description: 'Gestisci gli embed del dossier background' }
                ])
        );

        await interaction.reply({
            content: '🏠 **Benvenuto nell\'Embed Builder Visuale!**\n\nSeleziona un modulo qui sotto per iniziare a personalizzare l\'aspetto estetico del tuo bot.',
            components: [row],
            ephemeral: true
        });
    },
};
