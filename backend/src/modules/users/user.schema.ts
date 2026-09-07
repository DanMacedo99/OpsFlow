import { z } from 'zod'

import {
    userRoles,
} from '../auth/auth.types.js'

export const createUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email()),

    password: z
        .string()
        .min(12)
        .max(128),

    role: z.enum(userRoles),
})

export type CreateUserInput =
    z.infer<typeof createUserSchema>


export const updateUserRoleSchema = z.object({
    role: z.enum(userRoles),
})

export type UpdateUserRoleInput =
    z.infer<typeof updateUserRoleSchema>