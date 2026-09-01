import { databasePool } from '../../config/database.js'

import type {
    AuthUser,
    Organization,
    RegisterAccountRecord,
    RegistrationResult,
} from './auth.types.js'

export async function insertOrganizationAndAdmin(
    input: RegisterAccountRecord,
): Promise<RegistrationResult> {
    const client = await databasePool.connect()

    try {
        await client.query('BEGIN')

        const organizationResult =
            await client.query<Organization>(
                `
                    INSERT INTO organizations (
                        name,
                        slug
                    )
                    VALUES ($1, $2)
                    RETURNING
                        id,
                        name,
                        slug,
                        created_at AS "createdAt",
                        updated_at AS "updatedAt"
                `,
                [
                    input.organizationName,
                    input.organizationSlug,
                ],
            )

        const organization =
            organizationResult.rows[0]

        if (!organization) {
            throw new Error(
                'PostgreSQL did not return the created organization.',
            )
        }

        const userResult =
            await client.query<AuthUser>(
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
                        created_at AS "createdAt",
                        updated_at AS "updatedAt"
                `,
                [
                    organization.id,
                    input.userName,
                    input.email,
                    input.passwordHash,
                    'admin',
                ],
            )

        const user = userResult.rows[0]

        if (!user) {
            throw new Error(
                'PostgreSQL did not return the created user.',
            )
        }

        await client.query('COMMIT')

        return {
            organization,
            user,
        }
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

interface AuthenticationUserRow {
    id: string
    organization_id: string
    name: string
    email: string
    password_hash: string
    role: string
}

export interface AuthenticationUser {
    id: string
    organizationId: string
    name: string
    email: string
    passwordHash: string
    role: string
}

export async function findUserByEmail(
    email: string,
): Promise<AuthenticationUser | null> {
    const result =
        await databasePool.query<AuthenticationUserRow>(
            `
                SELECT
                    id,
                    organization_id,
                    name,
                    email,
                    password_hash,
                    role
                FROM users
                WHERE email = $1
                LIMIT 1
            `,
            [email],
        )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return {
        id: user.id,
        organizationId: user.organization_id,
        name: user.name,
        email: user.email,
        passwordHash: user.password_hash,
        role: user.role,
    }
}