import { EmbedBuilder } from 'discord.js';

/**
 * Utility to format professional and actionable error messages.
 */
class ErrorHelper {
    /**
     * Formats a descriptive error message.
     * @param {string} title - The error emoji/title.
     * @param {string} message - What happened.
     * @param {string} solution - What the user/staff should do to fix it.
     * @returns {string} Formatted string.
     */
    static formatActionable(title, message, solution) {
        return `${title} **${message}**\n\n💡 **Soluzione:** ${solution}`;
    }

    /**
     * Creates a professional error embed for critical configuration issues.
     * @param {string} title - Error title.
     * @param {string} description - Detailed description.
     * @param {string} steps - Numbered steps to fix.
     * @returns {EmbedBuilder}
     */
    static getErrorEmbed(title, description, steps) {
        return new EmbedBuilder()
            .setTitle(`❌ Errore: ${title}`)
            .setDescription(`${description}\n\n**🛠️ Come Risolvere:**\n${steps}`)
            .setColor('#ff4757')
            .setTimestamp();
    }

    /**
     * Predefined template for Role Hierarchy errors.
     */
    static roleHierarchyError(roleName) {
        return this.formatActionable(
            '❌',
            `Impossibile gestire il ruolo **${roleName}**.`,
            `Il ruolo del bot è posizionato sotto quello selezionato nella gerarchia. Vai in **Impostazioni Server -> Ruoli** e trascina il ruolo del bot sopra **${roleName}**.`
        );
    }

    /**
     * Predefined template for Disabled Modules.
     */
    static moduleDisabledError(moduleName) {
        return this.formatActionable(
            '❌',
            `Il modulo **${moduleName}** non è attivo su questo server.`,
            `Abilita il modulo nella sezione **Moduli** della Dashboard per sbloccare questa funzionalità.`
        );
    }

    /**
     * Predefined template for Missing Permissions in Category/Channel.
     */
    static permissionsError(missing) {
        return this.formatActionable(
            '❌',
            'Permessi insufficienti per operare.',
            `Il bot non può eseguire questa azione. Assicurati che abbia questi permessi nella categoria o nel canale:\n- ${missing.join('\n- ')}`
        );
    }
}

export default ErrorHelper;
