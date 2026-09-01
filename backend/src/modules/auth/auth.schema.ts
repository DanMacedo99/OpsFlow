import { z } from 'zod'

export const registerAccountSchema = z.object({
    organizationName: z
        .string()
        .trim()
        .min(2)
        .max(150),

    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    email: z
        .email()
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(12)
        .max(128),
})

export type RegisterAccountInput = z.infer<
    typeof registerAccountSchema
>

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email()),

    password: z
        .string()
        .min(1, 'Password is required.'),
})

export type LoginInput =
    z.infer<typeof loginSchema>