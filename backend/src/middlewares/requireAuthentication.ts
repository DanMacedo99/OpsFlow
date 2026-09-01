import type {
    RequestHandler,
} from 'express'

import { AppError } from '../errors/AppError.js'

export const requireAuthentication:
    RequestHandler = (
        request,
        _response,
        next,
    ): void => {
        if (!request.session.user) {
            next(
                new AppError(
                    401,
                    'AUTHENTICATION_REQUIRED',
                    'Authentication is required.',
                ),
            )

            return
        }

        next()
    }