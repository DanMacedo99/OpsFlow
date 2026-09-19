import { findAuditLogs } from './auditLog.repository.js'

import type {
    FindAuditLogsRecord,
    ListAuditLogsResult,
} from './auditLog.types.js'

import type {
    ListAuditLogsQuery,
} from './auditLog.schema.js'

export async function listAuditLogs(
    organizationId: string,
    query: ListAuditLogsQuery,
): Promise<ListAuditLogsResult> {
    const offset =
        (query.page - 1) * query.limit

    const record: FindAuditLogsRecord = {
        organizationId,
        limit: query.limit,
        offset,
    }

    if (query.action) {
        record.action = query.action
    }

    if (query.entityType) {
        record.entityType = query.entityType
    }

    if (query.actorUserId) {
        record.actorUserId = query.actorUserId
    }

    const result = await findAuditLogs(record)

    return {
        auditLogs: result.auditLogs,
        pagination: {
            page: query.page,
            limit: query.limit,
            total: result.total,
            totalPages: Math.ceil(
                result.total / query.limit,
            ),
        },
    }
}