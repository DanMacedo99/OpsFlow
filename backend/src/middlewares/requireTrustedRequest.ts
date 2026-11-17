import type {
    RequestHandler,
} from 'express'

import { AppError } from '../errors/AppError.js'

const protectedMethods = new Set([
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
])

export const requireTrustedRequest: RequestHandler =
    (
        request,
        _response,
        next,
    ): void => {
        if (
            !protectedMethods.has(request.method)
        ) {
            next()
            return
        }

        const requestMarker =
            request.get('X-OpsFlow-Request')

        if (requestMarker !== 'true') {
            next(
                new AppError(
                    403,
                    'UNTRUSTED_REQUEST',
                    'Request could not be verified.',
                ),
            )

            return
        }

        next()
    }