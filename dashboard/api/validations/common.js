import { z } from 'zod';

// Reusable primitives
export const colorHex = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Formato colore HEX non valido')
    .or(z.enum(['primary', 'success', 'error', 'warning', 'info']));
export const discordId = z.string().regex(/^\d{17,20}$/, 'ID Discord non valido').or(z.literal(''));
export const urlOrEmpty = z.string().url().or(z.string().length(0)).optional().nullable();

export const embedFieldSchema = z.object({
    name: z.string().min(1).max(256),
    value: z.string().min(1).max(1024),
    inline: z.boolean().optional()
});

export const embedDataSchema = z.object({
    title: z.string().max(256).optional().nullable(),
    description: z.string().max(4096).optional().nullable(),
    url: urlOrEmpty,
    color: colorHex.or(z.number()).optional().nullable(),
    image: urlOrEmpty,
    thumbnail: urlOrEmpty,
    timestamp: z.boolean().optional(),
    footer: z.string().max(2048).optional().nullable(),
    author: z.object({
        name: z.string().max(256).optional(),
        iconURL: urlOrEmpty,
        url: urlOrEmpty
    }).optional().nullable(),
    fields: z.array(embedFieldSchema).max(25).optional().nullable()
});
