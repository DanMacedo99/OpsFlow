import {
    argon2id,
    hash,
} from 'argon2'

import { AppError } from '../../errors/AppError.js'

import {
    isPostgresUniqueViolation,
} from '../../utils/postgresErrors.js'

import {
    findOrganizationUsers,
    insertOrganizationUser,
    updateOrganizationUserRole,
} from './user.repository.js'


import type {
    AuthUser,
} from '../auth/auth.types.js'

import type {
    CreateUserInput,
    UpdateUserRoleInput,
} from './user.schema.js'

export async function createOrganizationUser(
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
        return await insertOrganizationUser({
            organizationId,
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
        })
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

    const user = await updateOrganizationUserRole({
        userId: targetUserId,
        organizationId,
        role: input.role,
    })

    if (!user) {
        throw new AppError(
            404,
            'USER_NOT_FOUND',
            'User not found.',
        )
    }

    return user
}