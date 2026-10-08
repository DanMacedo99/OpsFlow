import type {
    NextFunction,
    Request,
    Response,
} from 'express'
import {
    expect,
    test,
    vi,
} from 'vitest'

import { AppError } from '../errors/AppError.js'
import {
    requireRole,
} from './requireRole.js'

test('rejects authenticated user without the required role', () => {
    const request = {
        session: {
            user: {
                id: 'user-001',
                organizationId: 'org-001',
                role: 'viewer',
            },
        },
    } as unknown as Request

    const response = {} as Response

    const next =
        vi.fn() as unknown as NextFunction

    const middleware =
        requireRole(
            'admin',
            'risk_manager',
        )

    middleware(
        request,
        response,
        next,
    )

    expect(next).toHaveBeenCalledTimes(1)

    const error =
        vi.mocked(next).mock.calls[0][0]

    expect(error).toBeInstanceOf(AppError)

    expect(error).toMatchObject({
        message:
            'You do not have permission to perform this action.',
    })
})

test('allows authenticated user with an allowed role', () => {
    const request = {
        session: {
            user: {
                id: 'user-001',
                organizationId: 'org-001',
                role: 'admin',
            },
        },
    } as unknown as Request

    const response = {} as Response

    const next =
        vi.fn() as unknown as NextFunction

    const middleware =
        requireRole(
            'admin',
            'risk_manager',
        )

    middleware(
        request,
        response,
        next,
    )

    expect(next).toHaveBeenCalledTimes(1)

    expect(next).toHaveBeenCalledWith()
})