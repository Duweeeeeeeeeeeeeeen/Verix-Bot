import { Events } from 'discord.js';

export default {
    name: Events.Raw,
    async execute(packet, client) {
        if (!packet || !['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
        if (client.reactionRoleManager) {
            await client.reactionRoleManager.handleRawReaction(packet);
        }
    }
};
