import type { AuthUser } from '../types/auth'

import type {
    CreateUserInput,
    UpdateUserRoleInput,
} from '../types/user'

import {
    ApiError,
    apiFetch,
} from './apiClient'

type UsersApiResponse = {
    data: AuthUser[]
}

type UserApiResponse = {
    data: AuthUser
}

type ApiErrorResponse = {
    error?: {
        code?: string
        message?: string
    }
}

async function createApiError(
    response: Response,
    fallbackMessage: string,
): Promise<ApiError> {
    let message = fallbackMessage

    try {
        const body =
            (await response.json()) as ApiErrorResponse

        if (body.error?.message) {
            message = body.error.message
        }
    } catch {
        // Keep fallback message.
    }

    return new ApiError(
        message,
        response.status,
    )
}

export async function getUsers(): Promise<AuthUser[]> {
    const response = await apiFetch('/users')

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not load users.',
        )
    }

    const responseBody =
        (await response.json()) as UsersApiResponse

    return responseBody.data
}

export async function createUser(
    input: CreateUserInput,
): Promise<AuthUser> {
    const response = await apiFetch(
        '/users',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not create user.',
        )
    }

    const responseBody =
        (await response.json()) as UserApiResponse

    return responseBody.data
}

export async function updateUserRole(
    userId: string,
    input: UpdateUserRoleInput,
): Promise<AuthUser> {
    const response = await apiFetch(
        `/users/${encodeURIComponent(
            userId,
        )}/role`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not update user role.',
        )
    }

    const responseBody =
        (await response.json()) as UserApiResponse

    return responseBody.data
}