import { createContext } from 'react'

import type {
    LoginInput,
    LoginUser,
} from '../types/auth'

export type AuthStatus =
    | 'loading'
    | 'authenticated'
    | 'unauthenticated'
    | 'error'

export interface AuthContextValue {
    user: LoginUser | null
    status: AuthStatus
    login: (input: LoginInput) => Promise<void>
    logout: () => Promise<void>
    retry: () => Promise<void>
}

export const AuthContext =
    createContext<AuthContextValue | null>(null)