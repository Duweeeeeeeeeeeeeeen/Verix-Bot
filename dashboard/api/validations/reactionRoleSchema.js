import { z } from 'zod';

export const reactionRoleSchema = z.object({
    enabled: z.boolean().default(false),
    panels: z.array(z.object({
        id: z.string(),
        name: z.string().default('Reaction Role Panel'),
        channelId: z.string(),
        messageId: z.string().nullable().default(null),
        type: z.enum(['BUTTON', 'REACTION']).default('BUTTON'),
        roles: z.array(z.object({
            roleId: z.string(),
            emoji: z.string().nullable().default(null),
            label: z.string().nullable().default(null),
            style: z.enum(['PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER']).default('PRIMARY')
        })),
        embed: z.object({
            title: z.string().default('Assegnazione Ruoli'),
            description: z.string().default('Select the roles you want to receive.'),
            color: z.string().default('#5865F2'),
            image: z.string().nullable().default(null),
            thumbnail: z.string().nullable().default(null),
            footer: z.string().default('Reaction Roles | Verix')
        })
    })).default([])
});
