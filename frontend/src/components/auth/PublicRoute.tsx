import {
    Navigate,
    Outlet,
} from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

export default function PublicRoute() {
    const { status } = useAuth()

    if (status === 'loading') {
        return (
            <main>
                <p role="status">
                    Checking your session...
                </p>
            </main>
        )
    }

    if (status === 'authenticated') {
        return (
            <Navigate
                to="/"
                replace
            />
        )
    }

    return <Outlet />
}