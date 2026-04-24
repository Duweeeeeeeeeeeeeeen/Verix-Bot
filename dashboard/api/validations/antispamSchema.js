import { z } from 'zod';

export const antispamSchema = z.object({
    enabled: z.boolean().default(false),
    maxMessages: z.number().min(1).max(50).default(5),
    timeWindow: z.number().min(1000).max(60000).default(5000),
    deleteSpam: z.boolean().default(true),
    warnUser: z.boolean().default(true),
    warnMessage: z.string().min(1).max(500).default('⚠️ {user}, per favore non spammare! Hai inviato troppi messaggi in poco tempo.'),
    ignoredRoles: z.array(z.string()).default([]),
    ignoredChannels: z.array(z.string()).default([])
});
