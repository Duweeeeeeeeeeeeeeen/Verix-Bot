import { Events } from 'discord.js';

export default {
    name: Events.MessageReactionAdd,
    async execute(reaction, user, client) {
        if (client.reactionRoleManager) {
            await client.reactionRoleManager.handleReaction(reaction, user, 'ADD');
        }
    },
};
