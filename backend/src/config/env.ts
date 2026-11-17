import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum([
        'development',
        'test',
        'production',
    ]),

    PORT: z.coerce
        .number()
        .int()
        .min(1)
        .max(65535)
        .default(3000),

    DATABASE_URL: z
        .string()
        .min(
            1,
            'DATABASE_URL is required.',
        ),

    CORS_ORIGIN: z
        .url(),

    SESSION_SECRET: z
        .string()
        .min(
            32,
            'SESSION_SECRET must contain at least 32 characters.',
        ),

    OPENAI_API_KEY: z
        .string()
        .min(1)
        .optional(),

    GEMINI_API_KEY: z
        .string()
        .min(1)
        .optional(),
    SESSION_COOKIE_SAME_SITE: z.enum([
        'lax',
        'strict',
        'none',
    ]),

    TRUST_PROXY: z
        .enum(['true', 'false'])
        .transform(
            (value) => value === 'true',
        ),

})

export const env = envSchema.parse(process.env)