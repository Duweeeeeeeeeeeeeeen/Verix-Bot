import messageService from './messageService.js';

/**
 * Utility to format professional and actionable error messages using the centralized system.
 */
class ErrorHelper {
    /**
     * Predefined template for Role Hierarchy errors.
     */
    static async roleHierarchyError(guildId, roleName) {
        return await messageService.get(guildId, 'system', 'role_hierarchy', { role: roleName });
    }

    /**
     * Predefined template for Disabled Modules.
     */
    static async moduleDisabledError(guildId, moduleName) {
        return await messageService.get(guildId, 'system', 'module_disabled', { module: moduleName });
    }

    /**
     * Predefined template for Missing Permissions in Category/Channel.
     */
    static async permissionsError(guildId, missing) {
        return await messageService.get(guildId, 'system', 'no_permission', { 
            error: missing.join(', ') 
        });
    }

    /**
     * Formats a descriptive error message (Legacy/Fallback).
     */
    static formatActionable(title, message, solution) {
        return `${title} **${message}**\n\n💡 **Cosa puoi fare:** ${solution}`;
    }
}

export default ErrorHelper;
