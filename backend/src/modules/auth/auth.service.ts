import {
    insertOrganizationAndAdmin,
} from './auth.repository.js'

import {
    hashPassword,
} from './auth.password.js'

import {
    createOrganizationSlug,
} from './auth.slug.js'

import type {
    RegisterAccountInput,
} from './auth.schema.js'

import type {
    RegistrationResult,
} from './auth.types.js'

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

function isPostgresUniqueViolation(
    error: unknown,
): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
    )
}