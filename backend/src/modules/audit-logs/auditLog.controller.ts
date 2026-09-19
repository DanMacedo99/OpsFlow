import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    getAuthenticatedOrganizationId,
} from '../auth/authSession.js'

import type {
    ListAuditLogsQuery,
} from './auditLog.schema.js'

import { listAuditLogs } from './auditLog.service.js'

interface AuditLogResponseLocals {
    validatedQuery: ListAuditLogsQuery
}

export async function getAuditLogs(
    request: Request,
    response: Response<
        unknown,
        AuditLogResponseLocals
    >,
    next: NextFunction,
): Promise<void> {
    try {
        const organizationId =
            getAuthenticatedOrganizationId(request)
        7
        const result = await listAuditLogs(
            organizationId,
            response.locals.validatedQuery,
        )

        response.status(200).json({
            data: result.auditLogs,
            pagination: result.pagination,
        })
    } catch (error) {
        next(error)
    }
}