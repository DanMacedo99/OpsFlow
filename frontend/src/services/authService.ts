import type {
    AuthUser,
    LoginInput,
    LoginUser,
    RegisterInput,
    RegistrationResult,
} from '../types/auth'
import { apiFetch } from './apiClient'

type CurrentUserResponse = {
    user: AuthUser
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    const response = await apiFetch('/auth/me')

    if (response.status === 401) {
        return null
    }

    if (!response.ok) {
        throw new Error(
            `Could not restore session. Status: ${response.status}`,
        )
    }

    const body =
        (await response.json()) as CurrentUserResponse

    return body.user
}

type LoginResponse = {
    user: LoginUser
}

export async function login(
    input: LoginInput,
): Promise<LoginUser> {
    const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    })

    if (response.status === 401) {
        throw new Error('Invalid email or password.')
    }

    if (!response.ok) {
        throw new Error(
            `Could not log in. Status: ${response.status}`,
        )
    }

    const body =
        (await response.json()) as LoginResponse

    return body.user
}

export async function logout(): Promise<void> {
    const response = await apiFetch('/auth/logout', {
        method: 'POST',
    })

    if (!response.ok) {
        throw new Error(
            `Could not log out. Status: ${response.status}`,
        )
    }
}

type RegisterResponse = {
    data: RegistrationResult
}

export async function register(
    input: RegisterInput,
): Promise<RegistrationResult> {
    const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    })

    if (response.status === 409) {
        throw new Error(
            'An account or organization with these details already exists.',
        )
    }

    if (!response.ok) {
        throw new Error(
            `Could not register account. Status: ${response.status}`,
        )
    }

    const body =
        (await response.json()) as RegisterResponse

    return body.data
}