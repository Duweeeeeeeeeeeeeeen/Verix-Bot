import { Events } from 'discord.js';
import logger from '../../utils/logger.js';

export default {
    name: Events.Raw,
    async execute(packet, client) {
        if (!packet || !['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
        logger.info(`[ReactionRoles/Raw] ${packet.t} guild=${packet.d?.guild_id || 'unknown'} message=${packet.d?.message_id || 'unknown'} emoji=${packet.d?.emoji?.id || packet.d?.emoji?.name || 'unknown'} user=${packet.d?.user_id || 'unknown'}`);
        if (client.reactionRoleManager) {
            await client.reactionRoleManager.handleRawReaction(packet);
        }
    }
};
