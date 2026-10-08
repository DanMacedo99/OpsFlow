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
    requireAuthentication,
} from './requireAuthentication.js'

test('rejects request when user is not authenticated', async () => {
    const request = {
        session: {
            user: undefined,
        },
    } as unknown as Request

    const response = {} as Response

    const next = vi.fn() as unknown as NextFunction

    await requireAuthentication(
        request,
        response,
        next,
    )

    expect(next).toHaveBeenCalledTimes(1)

    const error =
        vi.mocked(next).mock.calls[0][0]

    expect(error).toBeInstanceOf(AppError)

    expect(error).toMatchObject({
        message: 'Authentication is required.',
    })
})