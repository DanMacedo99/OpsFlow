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