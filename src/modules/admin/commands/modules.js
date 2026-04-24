import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import Guild from '../../../models/Guild.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import messageService from '../../../utils/messageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    data: new SlashCommandBuilder()
        .setName('modules')
        .setDescription('Gestisci i moduli attivi sul server.')
        .addSubcommand(sub => 
            sub.setName('list')
                .setDescription('Lista tutti i moduli e il loro stato'))
        .addSubcommand(sub => 
            sub.setName('enable')
                .setDescription('Attiva un modulo')
                .addStringOption(opt => opt.setName('name').setDescription('Nome del modulo').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('disable')
                .setDescription('Disattiva un modulo')
                .addStringOption(opt => opt.setName('name').setDescription('Nome del modulo').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });

        // Dynamic module discovery
        const modulesPath = path.join(__dirname, '../../../modules');
        const allModules = (await fs.readdir(modulesPath)).filter(folder => {
            const fullPath = path.join(modulesPath, folder);
            return fs.statSync(fullPath).isDirectory() && folder !== 'admin'; // Hide core admin module
        });

        if (subcommand === 'list') {
            const listStr = allModules.map(m => {
                const status = (guildData?.enabledModules || []).includes(m) ? '✅ Attivo' : '❌ Disattivato';
                return `**${m.toUpperCase()}**: ${status}`;
            }).join('\n');
            return messageService.reply(interaction, 'system', 'module_list', { list: listStr });
        }

        const moduleName = interaction.options.getString('name').toLowerCase();
        if (!allModules.includes(moduleName)) {
            return messageService.reply(interaction, 'system', 'module_not_found', { module: moduleName }, { ephemeral: true });
        }

        if (subcommand === 'enable') {
            if (!guildData.enabledModules) guildData.enabledModules = [];
            if (guildData.enabledModules.includes(moduleName)) {
                return messageService.reply(interaction, 'system', 'module_already_in_state', { module: moduleName }, { ephemeral: true });
            }
            guildData.enabledModules.push(moduleName);
            await guildData.save();
            return messageService.reply(interaction, 'system', 'module_enabled', { module: moduleName.toUpperCase() });
        }

        if (subcommand === 'disable') {
            if (!guildData.enabledModules || !guildData.enabledModules.includes(moduleName)) {
                return messageService.reply(interaction, 'system', 'module_already_in_state', { module: moduleName }, { ephemeral: true });
            }
            guildData.enabledModules = guildData.enabledModules.filter(m => m !== moduleName);
            await guildData.save();
            return messageService.reply(interaction, 'system', 'module_disabled_success', { module: moduleName.toUpperCase() });
        }
    },
};
