export const auditActions = [
    'user.created',
    'user.role_updated',
    'supplier.created',
    'supplier.updated',
    'supplier.deleted',
    'risk_assessment.created',
    'risk_assessment.decision_updated',
    'risk_assessment.document_status_updated',
] as const

export type AuditAction =
    (typeof auditActions)[number]

export const auditEntityTypes = [
    'user',
    'supplier',
    'risk_assessment',
] as const

export type AuditEntityType =
    (typeof auditEntityTypes)[number]

export type AuditSortOrder =
    | 'asc'
    | 'desc'

export interface AuditLog {
    id: string
    organizationId: string
    actorUserId: string | null
    action: AuditAction
    entityType: AuditEntityType
    entityId: string
    metadata: Record<string, unknown>
    createdAt: string
}

export interface AuditLogPagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface AuditLogFilters {
    page: number
    limit: number
    action?: AuditAction
    entityType?: AuditEntityType
    actorUserId?: string
    sortOrder: AuditSortOrder
}