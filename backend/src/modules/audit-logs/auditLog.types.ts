export const auditActions = [
    'user.created',
    'user.role_updated',
    'supplier.created',
    'supplier.updated',
    'supplier.deleted',
    'risk_assessment.created',
    'risk_assessment.decision_updated',
    'risk_assessment.document_status_updated',
    'document_analysis.completed',
    'document_analysis.reviewed',
    'document_analysis.review_updated',
    'document.uploaded',

] as const

export type AuditAction =
    (typeof auditActions)[number]

export const auditEntityTypes = [
    'user',
    'supplier',
    'risk_assessment',
    'document_analysis',
    'document',
] as const

export type AuditEntityType =
    (typeof auditEntityTypes)[number]

export interface CreateAuditLogRecord {
    organizationId: string
    actorUserId: string
    action: AuditAction
    entityType: AuditEntityType
    entityId: string
    metadata: Record<string, unknown>
}

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

export interface FindAuditLogsRecord {
    organizationId: string
    action?: AuditAction
    entityType?: AuditEntityType
    actorUserId?: string
    limit: number
    offset: number
    sortOrder: 'asc' | 'desc'
}

export interface FindAuditLogsResult {
    auditLogs: AuditLog[]
    total: number
}

export interface AuditLogPagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface ListAuditLogsResult {
    auditLogs: AuditLog[]
    pagination: AuditLogPagination
}