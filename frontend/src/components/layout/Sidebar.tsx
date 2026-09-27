import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

const navigationItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Suppliers', path: '/suppliers' },
    { label: 'Assessments', path: '/assessments' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
]

function Sidebar() {
    const {
        user,
        logout,
    } = useAuth()

    const [isLoggingOut, setIsLoggingOut] =
        useState(false)

    const [logoutError, setLogoutError] =
        useState<string | null>(null)

    async function handleLogout(): Promise<void> {
        setLogoutError(null)
        setIsLoggingOut(true)

        try {
            await logout()
        } catch {
            setLogoutError(
                'Could not sign out. Try again.',
            )
            setIsLoggingOut(false)
        }
    }

    return (
        <aside className="sidebar">
            <div className="brand">
                <strong>OpsFlow</strong>
                <span>Supplier Risk</span>
            </div>

            <nav aria-label="Primary navigation">
                <ul>
                    {navigationItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/'}
                                className={({
                                    isActive,
                                }) =>
                                    isActive
                                        ? 'nav-link active'
                                        : 'nav-link'
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-account">
                {user && (
                    <div className="sidebar-user">
                        <strong>{user.name}</strong>
                        <span>{user.role}</span>
                    </div>
                )}

                {logoutError && (
                    <p
                        className="sidebar-error"
                        role="alert"
                    >
                        {logoutError}
                    </p>
                )}

                <button
                    className="nav-link sidebar-logout"
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => {
                        void handleLogout()
                    }}
                >
                    {isLoggingOut
                        ? 'Signing out...'
                        : 'Sign out'}
                </button>
            </div>
        </aside>
    )
}

export default Sidebar