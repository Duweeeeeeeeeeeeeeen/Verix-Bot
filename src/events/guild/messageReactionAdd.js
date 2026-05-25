import { Events } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        logger.info(`[ReactionRoles/Event] messageReactionAdd message=${reaction.message?.id || 'unknown'} emoji=${reaction.emoji?.id || reaction.emoji?.name || 'unknown'} user=${user?.id || 'unknown'}`);
        if (client.reactionRoleManager) {
            logger.info('[ReactionRoles/Event] Forwarding messageReactionAdd to reaction role manager.');
            await client.reactionRoleManager.handleReaction(reaction, user, 'ADD');
        } else {
            logger.warn('[ReactionRoles/Event] Reaction role manager is not available on client for messageReactionAdd.');
        }
    },
};
