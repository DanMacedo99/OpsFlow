import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    registerAccount,
} from './auth.service.js'

import type {
    RegisterAccountInput,
} from './auth.schema.js'

export async function register(
    request: Request<
        Record<string, never>,
        unknown,
        RegisterAccountInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const registration =
            await registerAccount(
                request.body,
            )

        response.status(201).json({
            data: registration,
        })
    } catch (error) {
        next(error)
    }
}