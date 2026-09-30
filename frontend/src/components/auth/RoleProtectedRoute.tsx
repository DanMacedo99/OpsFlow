import {
    Navigate,
    Outlet,
} from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

import type {
    UserRole,
} from '../../types/auth'

interface RoleProtectedRouteProps {
    allowedRoles: UserRole[]
}

export default function RoleProtectedRoute({
    allowedRoles,
}: RoleProtectedRouteProps) {
    const { user } = useAuth()

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    return <Outlet />
}