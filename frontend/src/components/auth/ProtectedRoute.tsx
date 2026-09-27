import {
    Navigate,
    Outlet,
} from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute() {
    const {
        status,
        retry,
    } = useAuth()

    if (status === 'loading') {
        return (
            <main>
                <p role="status">
                    Checking your session...
                </p>
            </main>
        )
    }

    if (status === 'error') {
        return (
            <main>
                <h1>Unable to load your session</h1>

                <p>
                    Check your connection and try again.
                </p>

                <button
                    type="button"
                    onClick={() => {
                        void retry()
                    }}
                >
                    Try again
                </button>
            </main>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    return <Outlet />
}