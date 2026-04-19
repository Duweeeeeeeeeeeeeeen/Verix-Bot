import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import WhitelistConfig from '../../../models/WhitelistConfig.js';
import Guild from '../../../models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup-voice')
        .setDescription('Configura la modalità vocale e i requisiti della whitelist.')
        .addStringOption(opt => 
            opt.setName('mode')
               .setDescription('Modalità della Whitelist')
               .setRequired(true)
               .addChoices(
                   { name: 'Solo Testuale', value: 'TEXT' },
                   { name: 'Solo Vocale', value: 'VOICE' },
                   { name: 'Ibrida (Testo + Voce)', value: 'HYBRID' }
               )
        )
        .addChannelOption(opt => opt.setName('join_channel').setDescription('Canale d\'attesa per il vocale').setRequired(false))
        .addChannelOption(opt => opt.setName('category').setDescription('Categoria dove creare i canali temporanei').setRequired(false))
        .addIntegerOption(opt => opt.setName('concurrent_limit').setDescription('Numero massimo di colloqui contemporanei').setRequired(false))
        .addIntegerOption(opt => opt.setName('cooldown').setDescription('Minuti di attesa tra tentativi di join vocale').setRequired(false))
        .addRoleOption(opt => opt.setName('vip_role').setDescription('Ruolo VIP per saltare la coda').setRequired(false))
        .addBooleanOption(opt => opt.setName('ping_staff').setDescription('Menziona lo staff quando un utente entra in coda?').setRequired(false))
        .addStringOption(opt => opt.setName('checklist').setDescription('Punti checklist separati da virgola (es. Regolamento,Età,Microfono)').setRequired(false))
        .addBooleanOption(opt => opt.setName('require_text').setDescription('Richiedi whitelist testuale accettata prima del vocale').setRequired(false))
        .addBooleanOption(opt => opt.setName('require_bg').setDescription('Richiedi background accettato prima del vocale').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Module enablement check
        const guildData = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildData || !guildData.enabledModules.includes('whitelist')) {
            return interaction.reply({ content: '❌ Il modulo Whitelist non è attivo su questo server.', ephemeral: true });
        }

        const mode = interaction.options.getString('mode');
        const joinChannel = interaction.options.getChannel('join_channel');
        const category = interaction.options.getChannel('category');
        const maxConcurrent = interaction.options.getInteger('concurrent_limit');
        const cooldown = interaction.options.getInteger('cooldown');
        const vipRole = interaction.options.getRole('vip_role');
        const pingStaff = interaction.options.getBoolean('ping_staff');
        const checklistStr = interaction.options.getString('checklist');
        const requireText = interaction.options.getBoolean('require_text') ?? false;
        const requireBg = interaction.options.getBoolean('require_bg') ?? false;

        try {
            let config = await WhitelistConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                config = new WhitelistConfig({ guildId: interaction.guild.id });
            }

            config.mode = mode;
            
            if (joinChannel) config.voiceSettings.joinChannelId = joinChannel.id;
            if (category) config.voiceSettings.categoryId = category.id;
            if (maxConcurrent !== null) config.voiceSettings.maxConcurrent = maxConcurrent;
            if (cooldown !== null) config.voiceSettings.queueCooldown = cooldown;
            if (vipRole) config.voiceSettings.vipRoleId = vipRole.id;
            if (pingStaff !== null) config.voiceSettings.pingStaffOnJoin = pingStaff;
            if (checklistStr) config.voiceSettings.interviewChecklist = checklistStr.split(',').map(i => i.trim());
            
            config.flowRequirements.requireTextWL = requireText;
            config.flowRequirements.requireBackground = requireBg;

            await config.save();

            let statusMsg = `✅ **Elite Configurazione Vocale Aggiornata**\n- Modalità: \`${mode}\`\n- Limite: \`${config.voiceSettings.maxConcurrent}\`\n- VIP: ${vipRole || 'Nessuno'}\n- Ping Staff: ${config.voiceSettings.pingStaffOnJoin ? '✅' : '❌'}\n- Checklist: \`${config.voiceSettings.interviewChecklist.length}\` voci`;
            
            if (mode !== 'TEXT') {
                statusMsg += `\n- Canale Join: ${joinChannel || 'Non modificato'}\n- Categoria: ${category || 'Non modificata'}`;
            }

            await interaction.reply({ content: statusMsg, ephemeral: true });

        } catch (error) {
            console.error('Error in setup-voice:', error);
            await interaction.reply({ content: 'Si è verificato un errore durante il salvataggio.', ephemeral: true });
        }
    },
};
