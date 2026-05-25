import { Events } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: Events.Raw,
    async execute(packet, ...args) {
        const client = args.at(-1);
        if (!packet || !['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
        logger.info(`[ReactionRoles/Raw] ${packet.t} guild=${packet.d?.guild_id || 'unknown'} message=${packet.d?.message_id || 'unknown'} emoji=${packet.d?.emoji?.id || packet.d?.emoji?.name || 'unknown'} user=${packet.d?.user_id || 'unknown'}`);
        if (client.reactionRoleManager) {
            logger.info('[ReactionRoles/Raw] Forwarding event to reaction role manager.');
            await client.reactionRoleManager.handleRawReaction(packet);
        } else {
            logger.warn('[ReactionRoles/Raw] Reaction role manager is not available on client.');
        }
    }
};
