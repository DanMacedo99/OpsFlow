import {
    insertOrganizationAndAdmin,
    findUserByEmail,
    findActiveUserById,
} from './auth.repository.js'

import {
    hashPassword,
} from './auth.password.js'

import {
    createOrganizationSlug,
} from './auth.slug.js'

import type {
    LoginInput,
    RegisterAccountInput,
} from './auth.schema.js'

import type {
    AuthUser,
    RegistrationResult,
    UserRole,
} from './auth.types.js'

import {
    verify,
} from 'argon2'

import { isPostgresUniqueViolation } from '../../utils/postgresErrors.js'

import { AppError } from '../../errors/AppError.js'

export async function registerAccount(
    input: RegisterAccountInput,
): Promise<RegistrationResult> {
    const organizationSlug =
        createOrganizationSlug(
            input.organizationName,
        )

    if (!organizationSlug) {
        throw new Error(
            'The organization name cannot generate a valid slug.',
        )
    }

    const passwordHash =
        await hashPassword(input.password)

    try {
        return await insertOrganizationAndAdmin({
            organizationName: input.organizationName,
            organizationSlug,
            userName: input.name,
            email: input.email,
            passwordHash,
        })
    } catch (error) {
        if (isPostgresUniqueViolation(error)) {
            throw new AppError(
                409,
                'REGISTRATION_CONFLICT',
                'An account or organization with these details already exists.',
            )
        }

        throw error
    }
}


export interface LoginResult {
    id: string
    organizationId: string
    name: string
    email: string
    role: UserRole
}

export async function login(
    input: LoginInput,
): Promise<LoginResult> {
    const user =
        await findUserByEmail(input.email)

    if (!user) {
        throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'Invalid email or password.',
        )
    }

    const passwordMatches = await verify(
        user.passwordHash,
        input.password,
    )

    if (!passwordMatches) {
        throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'Invalid email or password.',
        )
    }

    return {
        id: user.id,
        organizationId: user.organizationId,
        name: user.name,
        email: user.email,
        role: user.role,
    }
}

export function getActiveUserForSession(
    userId: string,
): Promise<AuthUser | null> {
    return findActiveUserById(userId)
}