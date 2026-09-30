import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { UserRole } from '../../types/auth'

import { useAuth } from '../../hooks/useAuth'

interface NavigationItem {
    label: string
    path: string
    allowedRoles?: UserRole[]
}

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        path: '/',
    },
    {
        label: 'Suppliers',
        path: '/suppliers',
    },
    {
        label: 'Assessments',
        path: '/assessments',
    },

    {
        label: 'User Management',
        path: '/users',
        allowedRoles: ['admin'],
    },
    {
        label: 'Audit Logs',
        path: '/audit-logs',
        allowedRoles: ['admin'],
    },

    {
        label: 'Reports',
        path: '/reports',
    },
    {
        label: 'Settings',
        path: '/settings',
    },

]

function Sidebar() {



    const {
        user,
        logout,
    } = useAuth()

    const visibleNavigationItems =
        navigationItems.filter((item) => {
            if (!item.allowedRoles) {
                return true
            }

            if (!user) {
                return false
            }

            return item.allowedRoles.includes(
                user.role,
            )
        })

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
                    {visibleNavigationItems.map((item) => (
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