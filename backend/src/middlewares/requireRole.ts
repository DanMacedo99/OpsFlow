import type {
    RequestHandler,
} from 'express'

import { AppError } from '../errors/AppError.js'

import type {
    UserRole,
} from '../modules/auth/auth.types.js'

export function requireRole(
    ...allowedRoles: UserRole[]
): RequestHandler {
    return (
        request,
        _response,
        next,
    ): void => {
        const user = request.session.user

        if (!user) {
            next(
                new AppError(
                    401,
                    'AUTHENTICATION_REQUIRED',
                    'Authentication is required.',
                ),
            )

            return
        }

        if (!allowedRoles.includes(user.role)) {
            next(
                new AppError(
                    403,
                    'INSUFFICIENT_PERMISSIONS',
                    'You do not have permission to perform this action.',
                ),
            )

            return
        }

        next()
    }
}