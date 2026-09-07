import type { RequestHandler } from 'express'

import { AppError } from '../errors/AppError.js'
import {
    getActiveUserForSession,
} from '../modules/auth/auth.service.js'

export const requireAuthentication: RequestHandler =
    async (
        request,
        _response,
        next,
    ): Promise<void> => {
        try {
            const sessionUser = request.session.user

            if (!sessionUser) {
                next(
                    new AppError(
                        401,
                        'AUTHENTICATION_REQUIRED',
                        'Authentication is required.',
                    ),
                )
                return
            }

            const currentUser =
                await getActiveUserForSession(
                    sessionUser.id,
                )

            if (!currentUser) {
                request.session.destroy((error) => {
                    if (error) {
                        next(error)
                        return
                    }

                    next(
                        new AppError(
                            401,
                            'AUTHENTICATION_REQUIRED',
                            'Authentication is required.',
                        ),
                    )
                })

                return
            }

            request.session.user = {
                id: currentUser.id,
                organizationId:
                    currentUser.organizationId,
                role: currentUser.role,
            }

            next()
        } catch (error) {
            next(error)
        }
    }