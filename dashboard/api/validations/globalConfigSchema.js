import { z } from 'zod';

// ─────────────────────────────────────────────
// Utility Validators
// ─────────────────────────────────────────────

const discordId = z.string()
    .regex(/^\d{17,20}$/, "ID Discord non valido (deve essere tra 17 e 20 cifre)")
    .or(z.literal(''))
    .nullable()
    .default(null);

const emojiSchema = z.string()
    .max(100, "L'emoji è troppo lunga (max 100 caratteri)")
    .default('')
    .optional();

const namingSchema = z.string()
    .max(100, "Il template di naming è troppo lungo")
    .optional()
    .default('{user}')
    .refine(s => !s || s.includes('{user}'), {
        message: "Il template deve contenere il placeholder {user} per evitare nomi duplicati"
    });

// ─────────────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────────────

const buttonConfigSchema = z.object({
    customId: z.string()
        .min(1, "L'ID del bottone non può essere vuoto")
        .max(100),
    label: z.string()
        .min(1, "La label del bottone è obbligatoria")
        .max(80, "La label è troppo lunga (max 80 caratteri)"),
    emoji: emojiSchema,
    style: z.enum(['PRIMARY', 'SUCCESS', 'DANGER', 'SECONDARY'], {
        errorMap: () => ({ message: "Stile bottone non valido" })
    }).default('PRIMARY'),
    enabled: z.boolean().default(true)
});

const notificationEventSchema = z.object({
    dm: z.boolean().default(false),
    channel: z.boolean().default(false),
    channelId: discordId
});

// ─────────────────────────────────────────────
// Main Schema (Max 2 Levels Deep)
// ─────────────────────────────────────────────

export const globalConfigSchema = z.object({
    ui: z.object({
        whitelistButtons: z.array(buttonConfigSchema).max(25, "Limite di 25 bottoni whitelist raggiunto").optional(),
        ticketButtons:    z.array(buttonConfigSchema).max(25, "Limite di 25 bottoni ticket raggiunto").optional(),
        voiceButtons:     z.array(buttonConfigSchema).max(25, "Limite di 25 bottoni voice raggiunto").optional()
    }).partial().optional(),

    adminRoleIds: z.array(z.string()).optional(),
    language: z.enum(['it', 'en', 'es', 'fr', 'de', 'pt']).optional(),

    notifications: z.object({
        whitelist_onSubmit: notificationEventSchema.optional().nullable(),
        whitelist_onAccept: notificationEventSchema.optional().nullable(),
        whitelist_onReject: notificationEventSchema.optional().nullable(),
        tickets_onOpen:     notificationEventSchema.optional().nullable(),
        tickets_onClose:    notificationEventSchema.optional().nullable()
    }).partial().optional().nullable(),

    logs: z.object({
        enabled:          z.boolean().default(true).optional().nullable(),
        channelId:        discordId,
        log_onSubmit:     z.boolean().default(true).optional().nullable(),
        log_onAccept:     z.boolean().default(true).optional().nullable(),
        log_onReject:     z.boolean().default(true).optional().nullable(),
        log_onOpen:       z.boolean().default(true).optional().nullable(),
        log_onClose:      z.boolean().default(true).optional().nullable(),
        log_onVoiceStart: z.boolean().default(true).optional().nullable(),
        log_onVoiceEnd:   z.boolean().default(false).optional().nullable()
    }).partial().optional().nullable(),

    naming: z.object({
        voiceChannel: namingSchema.optional().default('wl-{user}'),
        ticket:       namingSchema.optional().default('{emoji}-{type}-{user}')
    }).partial().optional().nullable()
}).partial().passthrough();
