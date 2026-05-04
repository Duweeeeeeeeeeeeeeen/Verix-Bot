/**
 * Zod validation middleware for Express routes.
 * Parses req.body against the schema and stores cleaned data in req.validatedData.
 * @param {import('zod').ZodSchema} schema 
 */
export const validate = (schema) => (req, res, next) => {
    try {
        // 1. LOG BODY BEFORE VALIDATION
        console.log(`[DEBUG_API] Body for ${req.method} ${req.url}:`, JSON.stringify(req.body, null, 2));

        const result = schema.safeParse(req.body);
        if (!result.success) {
            // 2. LOG FULL ZOD ERROR
            console.error(`[VALIDATION_ERROR] ${req.method} ${req.url}:`, JSON.stringify(result.error?.format() || result.error, null, 2));
            
            const errorDetails = result.error?.errors?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [];

            // 5. DETAILED FALLBACK RESPONSE
            return res.status(400).json({ 
                success: false,
                error: 'Validation failed', 
                details: errorDetails
            });
        }
        // STRIP UNKNOWN FIELDS (Implicit via Zod result)
        req.validatedData = result.data;
        next();
    } catch (error) {
        console.error(`[CRITICAL_VALIDATION_CRASH] ${req.method} ${req.url}:`, error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Validation Crash', 
            message: error.message,
            stack: error.stack 
        });
    }
};
