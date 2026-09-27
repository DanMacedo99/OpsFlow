import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import type { ReactNode } from 'react'

import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
} from '../services/authService'

import type {
    LoginInput,
    LoginUser,
} from '../types/auth'

import {
    AuthContext,
    type AuthStatus,
} from './authContext'

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<LoginUser | null>(null)

    const [status, setStatus] =
        useState<AuthStatus>('loading')

    const restoreSession = useCallback(
        async (): Promise<void> => {
            setStatus('loading')

            try {
                const currentUser =
                    await getCurrentUser()

                setUser(currentUser)
                setStatus(
                    currentUser
                        ? 'authenticated'
                        : 'unauthenticated',
                )
            } catch {
                setUser(null)
                setStatus('error')
            }
        },
        [],
    )

    useEffect(() => {
    function handleUnauthorized() {
      
        setUser(null)
        setStatus('unauthenticated')
    }

    window.addEventListener(
        'auth:unauthorized',
        handleUnauthorized,
    )

    return () => {
        window.removeEventListener(
            'auth:unauthorized',
            handleUnauthorized,
        )
    }
}, [])

    useEffect(() => {
        void restoreSession()
    }, [restoreSession])

    const login = useCallback(
        async (input: LoginInput): Promise<void> => {
            const authenticatedUser =
                await loginRequest(input)

            setUser(authenticatedUser)
            setStatus('authenticated')
        },
        [],
    )

    const logout = useCallback(
        async (): Promise<void> => {
            await logoutRequest()

            setUser(null)
            setStatus('unauthenticated')
        },
        [],
    )

    const contextValue = useMemo(
        () => ({
            user,
            status,
            login,
            logout,
            retry: restoreSession,
        }),
        [
            user,
            status,
            login,
            logout,
            restoreSession,
        ],
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}