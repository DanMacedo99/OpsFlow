import type { PoolClient } from 'pg'
import { databasePool } from '../../config/database.js'
import type {
    AuditLog,
    CreateAuditLogRecord,
    FindAuditLogsRecord,
    FindAuditLogsResult,
} from './auditLog.types.js'

export async function insertAuditLog(
    client: PoolClient,
    input: CreateAuditLogRecord,
): Promise<AuditLog> {
    const result = await client.query<AuditLog>(
        `
            INSERT INTO audit_logs (
                organization_id,
                actor_user_id,
                action,
                entity_type,
                entity_id,
                metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                organization_id AS "organizationId",
                actor_user_id AS "actorUserId",
                action,
                entity_type AS "entityType",
                entity_id AS "entityId",
                metadata,
                created_at::text AS "createdAt"
        `,
        [
            input.organizationId,
            input.actorUserId,
            input.action,
            input.entityType,
            input.entityId,
            JSON.stringify(input.metadata),
        ],
    )

    const auditLog = result.rows[0]

    if (!auditLog) {
        throw new Error(
            'PostgreSQL did not return the created audit log.',
        )
    }

    return auditLog
}

export async function findAuditLogs(
    input: FindAuditLogsRecord,
): Promise<FindAuditLogsResult> {
    const parameters = [
        input.organizationId,
        input.action ?? null,
        input.entityType ?? null,
        input.actorUserId ?? null,
    ]

    const filters = `
        WHERE organization_id = $1
          AND ($2::varchar IS NULL OR action = $2)
          AND ($3::varchar IS NULL OR entity_type = $3)
          AND ($4::uuid IS NULL OR actor_user_id = $4)
    `

    const [auditLogsResult, totalResult] =
        await Promise.all([
            databasePool.query<AuditLog>(
                `
                    SELECT
                        id,
                        organization_id AS "organizationId",
                        actor_user_id AS "actorUserId",
                        action,
                        entity_type AS "entityType",
                        entity_id AS "entityId",
                        metadata,
                        created_at::text AS "createdAt"
                    FROM audit_logs
                    ${filters}
                    ORDER BY
                        created_at DESC,
                        id DESC
                    LIMIT $5
                    OFFSET $6
                `,
                [
                    ...parameters,
                    input.limit,
                    input.offset,
                ],
            ),

            databasePool.query<{ total: string }>(
                `
                    SELECT COUNT(*) AS total
                    FROM audit_logs
                    ${filters}
                `,
                parameters,
            ),
        ])

    return {
        auditLogs: auditLogsResult.rows,
        total: Number(
            totalResult.rows[0]?.total ?? 0,
        ),
    }
}