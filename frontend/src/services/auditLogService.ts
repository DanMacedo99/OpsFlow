import type {
    AuditLog,
    AuditLogFilters,
    AuditLogPagination,
} from '../types/auditLog'

import {
    ApiError,
    apiFetch,
} from './apiClient'

interface AuditLogsApiResponse {
    data: AuditLog[]
    pagination: AuditLogPagination
}

interface ApiErrorResponse {
    error?: {
        code?: string
        message?: string
    }
}

async function createApiError(
    response: Response,
    fallbackMessage: string,
): Promise<ApiError> {
    let message = fallbackMessage

    try {
        const body =
            (await response.json()) as ApiErrorResponse

        if (body.error?.message) {
            message = body.error.message
        }
    } catch {
        // Keep fallback message.
    }

    return new ApiError(
        message,
        response.status,
    )
}

export async function getAuditLogs(
    filters: AuditLogFilters,
): Promise<AuditLogsApiResponse> {
    const params = new URLSearchParams()

    params.set(
        'page',
        String(filters.page),
    )

    params.set(
        'limit',
        String(filters.limit),
    )

    params.set(
        'sortOrder',
        filters.sortOrder,
    )

    if (filters.action) {
        params.set(
            'action',
            filters.action,
        )
    }

    if (filters.entityType) {
        params.set(
            'entityType',
            filters.entityType,
        )
    }

    if (filters.actorUserId) {
        params.set(
            'actorUserId',
            filters.actorUserId,
        )
    }

    const response = await apiFetch(
        `/audit-logs?${params.toString()}`,
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not load audit logs.',
        )
    }

    return (
        await response.json()
    ) as AuditLogsApiResponse
}