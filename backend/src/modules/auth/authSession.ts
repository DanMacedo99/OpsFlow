import type {
    Request,
} from 'express'

import type { SessionData } from 'express-session'

import { AppError } from '../../errors/AppError.js'

type AuthenticatedSessionUser =
    NonNullable<SessionData['user']>

export function getAuthenticatedUser(
    request: Request,
): AuthenticatedSessionUser {
    const user = request.session.user

    if (!user) {
        throw new AppError(
            401,
            'AUTHENTICATION_REQUIRED',
            'Authentication is required.',
        )
    }

    return user
}

export function getAuthenticatedOrganizationId(
    request: Request,
): string {

    return getAuthenticatedUser(request).organizationId
}