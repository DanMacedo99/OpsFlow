import { z } from 'zod'

import {
    auditActions,
    auditEntityTypes,
} from './auditLog.types.js'

export const listAuditLogsQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    action: z.enum(auditActions).optional(),

    entityType: z
        .enum(auditEntityTypes)
        .optional(),

    actorUserId: z
        .uuid()
        .optional(),
})

export type ListAuditLogsQuery = z.infer<
    typeof listAuditLogsQuerySchema
>