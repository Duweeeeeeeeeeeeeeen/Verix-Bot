import { Events } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: Events.MessageReactionRemove,
    async execute(reaction, user, client) {
        logger.info(`[ReactionRoles/Event] messageReactionRemove message=${reaction.message?.id || 'unknown'} emoji=${reaction.emoji?.id || reaction.emoji?.name || 'unknown'} user=${user?.id || 'unknown'}`);
        if (client.reactionRoleManager) {
            await client.reactionRoleManager.handleReaction(reaction, user, 'REMOVE');
        }
    },
};
