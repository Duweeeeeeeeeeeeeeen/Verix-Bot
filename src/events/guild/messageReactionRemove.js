import { Events } from 'discord.js';

export default {
    name: Events.MessageReactionRemove,
    async execute(reaction, user, client) {
        if (client.reactionRoleManager) {
            await client.reactionRoleManager.handleReaction(reaction, user, 'REMOVE');
        }
    },
};
