import { Router } from 'express'

import {
    requireAuthentication,
} from '../../middlewares/requireAuthentication.js'

import {
    requireRole,
} from '../../middlewares/requireRole.js'

import {
    validateQuery,
} from '../../middlewares/validateQuery.js'

import {
    getAuditLogs,
} from './auditLog.controller.js'

import {
    listAuditLogsQuerySchema,
} from './auditLog.schema.js'

export const auditLogRouter = Router()

auditLogRouter.get(
    '/',
    requireAuthentication,
    requireRole('admin'),
    validateQuery(listAuditLogsQuerySchema),
    getAuditLogs,
)