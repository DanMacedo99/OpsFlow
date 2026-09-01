import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    registerAccount, login as loginService
} from './auth.service.js'

import { loginSchema } from './auth.schema.js'

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

export async function loginController(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    const parsedInput =
        loginSchema.safeParse(request.body)

    if (!parsedInput.success) {
        response.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid login data.',
                details:
                    parsedInput.error.flatten(),
            },
        })

        return
    }

    try {
        const user =
            await loginService(parsedInput.data)

        await regenerateSession(request)

        request.session.user = {
            id: user.id,
            organizationId:
                user.organizationId,
            role: user.role,
        }

        await saveSession(request)

        response.status(200).json({
            user,
        })
    } catch (error) {
        next(error)
    }
}

function regenerateSession(
    request: Request,
): Promise<void> {
    return new Promise((resolve, reject) => {
        request.session.regenerate((error) => {
            if (error) {
                reject(error)
                return
            }

            resolve()
        })
    })
}

function saveSession(
    request: Request,
): Promise<void> {
    return new Promise((resolve, reject) => {
        request.session.save((error) => {
            if (error) {
                reject(error)
                return
            }

            resolve()
        })
    })
}

export async function logoutController(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        await destroySession(request)

        response.clearCookie('opsflow.sid')
        response.status(204).send()
    } catch (error) {
        next(error)
    }
}

function destroySession(
    request: Request,
): Promise<void> {
    return new Promise((resolve, reject) => {
        request.session.destroy((error) => {
            if (error) {
                reject(error)
                return
            }

            resolve()
        })
    })
}