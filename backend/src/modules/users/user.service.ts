import {
    argon2id,
    hash,
} from 'argon2'

import {
    runInTransaction,
} from '../../config/database.js'

import {
    insertAuditLog,
} from '../audit-logs/auditLog.repository.js'

import { AppError } from '../../errors/AppError.js'

import {
    isPostgresUniqueViolation,
} from '../../utils/postgresErrors.js'

import {
    findOrganizationUsers,
    insertOrganizationUser,
    updateOrganizationUserRole,
    findOrganizationUserByIdForUpdate,
} from './user.repository.js'


import type {
    AuthUser,
} from '../auth/auth.types.js'

import type {
    CreateUserInput,
    UpdateUserRoleInput,
} from './user.schema.js'

export async function createOrganizationUser(
    authenticatedUserId: string,
    organizationId: string,
    input: CreateUserInput,
): Promise<AuthUser> {
    const passwordHash = await hash(
        input.password,
        {
            type: argon2id,
        },
    )

    try {
        return await runInTransaction(
            async (client) => {
                const user =
                    await insertOrganizationUser(
                        client,
                        {
                            organizationId,
                            name: input.name,
                            email: input.email,
                            passwordHash,
                            role: input.role,
                        },
                    )
                await insertAuditLog(client, {
                    organizationId,
                    actorUserId:
                        authenticatedUserId,
                    action: 'user.created',
                    entityType: 'user',
                    entityId: user.id,
                    metadata: {
                        assignedRole: user.role,
                    },
                })

                return user
            },
        )
    } catch (error) {
        if (isPostgresUniqueViolation(error)) {
            throw new AppError(
                409,
                'USER_EMAIL_ALREADY_EXISTS',
                'A user with this email already exists.',
            )
        }

        throw error
    }
}

export function listOrganizationUsers(
    organizationId: string,
): Promise<AuthUser[]> {
    return findOrganizationUsers(organizationId)
}

export async function changeOrganizationUserRole(
    authenticatedUserId: string,
    organizationId: string,
    targetUserId: string,
    input: UpdateUserRoleInput,
): Promise<AuthUser> {
    if (authenticatedUserId === targetUserId) {
        throw new AppError(
            409,
            'CANNOT_CHANGE_OWN_ROLE',
            'You cannot change your own role.',
        )
    }

    return runInTransaction(async (client) => {
        const currentUser =
            await findOrganizationUserByIdForUpdate(
                client,
                targetUserId,
                organizationId,
            )

        if (!currentUser) {
            throw new AppError(
                404,
                'USER_NOT_FOUND',
                'User not found.',
            )
        }

        if (currentUser.role === input.role) {
            return currentUser
        }

        const updatedUser =
            await updateOrganizationUserRole(
                client,
                {
                    userId: targetUserId,
                    organizationId,
                    role: input.role,
                },
            )

        if (!updatedUser) {
            throw new AppError(
                404,
                'USER_NOT_FOUND',
                'User not found.',
            )
        }

        await insertAuditLog(client, {
            organizationId,
            actorUserId: authenticatedUserId,
            action: 'user.role_updated',
            entityType: 'user',
            entityId: targetUserId,
            metadata: {
                previousRole: currentUser.role,
                newRole: updatedUser.role,
            },
        })

        return updatedUser
    })
}
