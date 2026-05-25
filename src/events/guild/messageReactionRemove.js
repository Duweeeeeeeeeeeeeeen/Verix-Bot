import { Events } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: Events.MessageReactionRemove,
    async execute(reaction, user, ...args) {
        const client = args.at(-1);
        logger.info(`[ReactionRoles/Event] messageReactionRemove message=${reaction.message?.id || 'unknown'} emoji=${reaction.emoji?.id || reaction.emoji?.name || 'unknown'} user=${user?.id || 'unknown'}`);
        if (client.reactionRoleManager) {
            logger.info('[ReactionRoles/Event] Forwarding messageReactionRemove to reaction role manager.');
            await client.reactionRoleManager.handleReaction(reaction, user, 'REMOVE');
        } else {
            logger.warn('[ReactionRoles/Event] Reaction role manager is not available on client for messageReactionRemove.');
        }
    },
};
