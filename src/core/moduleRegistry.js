import TicketConfig from '../models/TicketConfig.js';
import WhitelistConfig from '../models/WhitelistConfig.js';
import BackgroundConfig from '../models/BackgroundConfig.js';
import VerifyConfig from '../models/VerifyConfig.js';
import WelcomeConfig from '../models/WelcomeConfig.js';
import PhotoContestConfig from '../models/PhotoContestConfig.js';

/**
 * Registry of all bot modules with their identifying prefixes and associated models.
 * This is the SINGLE SOURCE OF TRUTH for module mapping.
 */
export const registry = {
    tickets: {
        name: 'Tickets',
        prefixes: ['ticket_', 'tk_'], // Prefixes used in customIds (Buttons, Selects, Modals)
        model: TicketConfig
    },
    whitelist: {
        name: 'Whitelist',
        prefixes: ['wl_', 'start_wl'],
        model: WhitelistConfig
    },
    verify: {
        name: 'Verify',
        prefixes: ['verify_'],
        model: VerifyConfig
    },
    background: {
        name: 'Background',
        prefixes: ['bg_'],
        model: BackgroundConfig
    },
    admin: {
        name: 'Admin',
        prefixes: ['embed_'],
        model: null // Admin module usually always enabled
    },
    welcome: {
        name: 'Welcome',
        prefixes: [], // No prefix components for now
        model: WelcomeConfig
    },
    photoContest: {
        name: 'PhotoContest',
        prefixes: ['photo_'], // Used for photo_vote_up, photo_vote_down
        model: PhotoContestConfig
    }
};

/**
 * Resolves which module an interaction belongs to based on command name or customId.
 * @param {import('discord.js').Interaction} interaction 
 * @returns {string|null} The module name (key in registry) or null if not found.
 */
export function resolveModule(interaction) {
    let identifier = '';

    // 1. Slash Commands: Use the module property attached during loading
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        return command?.module || null;
    }

    // 2. Components & Modals: Identify by CustomId prefix
    if (interaction.customId) {
        identifier = interaction.customId;
    } else if (interaction.isModalSubmit()) {
        identifier = interaction.customId;
    }

    if (identifier) {
        for (const [moduleName, config] of Object.entries(registry)) {
            if (config.prefixes.some(prefix => identifier.startsWith(prefix))) {
                return moduleName;
            }
        }
    }

    return null;
}
