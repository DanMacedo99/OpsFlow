import { databasePool } from '../../config/database.js'
import type { PoolClient } from 'pg'
import type {
    AuthUser,
} from '../auth/auth.types.js'

import type {
    CreateUserRecord,
    UpdateOrganizationUserRoleRecord,
} from './user.types.js'

export async function insertOrganizationUser(
    client: PoolClient,
    input: CreateUserRecord,
): Promise<AuthUser> {
    const result = await client.query<AuthUser>(
        `
            INSERT INTO users (
                organization_id,
                name,
                email,
                password_hash,
                role
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                organization_id AS "organizationId",
                name,
                email,
                role,
                is_active AS "isActive",
                created_at::text AS "createdAt",
                updated_at::text AS "updatedAt"
        `,
        [
            input.organizationId,
            input.name,
            input.email,
            input.passwordHash,
            input.role,
        ],
    )

    const user = result.rows[0]

    if (!user) {
        throw new Error(
            'PostgreSQL did not return the created user.',
        )
    }

    return user
}

export async function findOrganizationUsers(
    organizationId: string,
): Promise<AuthUser[]> {
    const result = await databasePool.query<AuthUser>(
        `
            SELECT
                id,
                organization_id AS "organizationId",
                name,
                email,
                role,
                is_active AS "isActive",
                created_at::text AS "createdAt",
                updated_at::text AS "updatedAt"
            FROM users
            WHERE organization_id = $1
            ORDER BY created_at ASC
        `,
        [organizationId],
    )

    return result.rows
}

export async function updateOrganizationUserRole(
    client: PoolClient,
    input: UpdateOrganizationUserRoleRecord,
): Promise<AuthUser | null> {
    const result = await client.query<AuthUser>(
        `
            UPDATE users
            SET
                role = $3,
                updated_at = current_timestamp
            WHERE id = $1
              AND organization_id = $2
            RETURNING
                id,
                organization_id AS "organizationId",
                name,
                email,
                role,
                is_active AS "isActive",
                created_at::text AS "createdAt",
                updated_at::text AS "updatedAt"
        `,
        [
            input.userId,
            input.organizationId,
            input.role,
        ],
    )

    return result.rows[0] ?? null
}

export async function findOrganizationUserByIdForUpdate(
    client: PoolClient,
    userId: string,
    organizationId: string,
): Promise<AuthUser | null> {
    const result = await client.query<AuthUser>(
        `
            SELECT
                id,
                organization_id AS "organizationId",
                name,
                email,
                role,
                is_active AS "isActive",
                created_at::text AS "createdAt",
                updated_at::text AS "updatedAt"
            FROM users
            WHERE id = $1
              AND organization_id = $2
            FOR UPDATE
        `,
        [userId, organizationId],
    )

    return result.rows[0] ?? null
}