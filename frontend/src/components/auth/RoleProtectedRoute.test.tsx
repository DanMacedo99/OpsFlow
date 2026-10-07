import {
    MemoryRouter,
    Route,
    Routes,
} from 'react-router-dom'

import {
    render,
    screen,
} from '@testing-library/react'

import {
    expect,
    test,
    vi,
} from 'vitest'

import RoleProtectedRoute from './RoleProtectedRoute'

import {
    useAuth,
} from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

test('allows an admin to access an admin route', () => {
    mockedUseAuth.mockReturnValue({
        user: {
            id: 'user-1',
            organizationId: 'org-1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
        },
        status: 'authenticated',
        login: vi.fn(async () => { }),
        logout: vi.fn(async () => { }),
        retry: vi.fn(async () => { }),
    })

    render(
        <MemoryRouter
            initialEntries={['/users']}
        >
            <Routes>
                <Route
                    element={
                        <RoleProtectedRoute
                            allowedRoles={['admin']}
                        />
                    }
                >
                    <Route
                        path="/users"
                        element={
                            <h1>
                                User Management
                            </h1>
                        }
                    />
                </Route>
            </Routes>
        </MemoryRouter>,
    )

    expect(
        screen.getByRole('heading', {
            name: 'User Management',
        }),
    ).toBeInTheDocument()
})

test('redirects a viewer away from an admin route', () => {
    mockedUseAuth.mockReturnValue({
        user: {
            id: 'user-2',
            organizationId: 'org-1',
            name: 'Viewer User',
            email: 'viewer@example.com',
            role: 'viewer',
        },
        status: 'authenticated',
        login: vi.fn(async () => { }),
        logout: vi.fn(async () => { }),
        retry: vi.fn(async () => { }),
    })

    render(
        <MemoryRouter
            initialEntries={['/users']}
        >
            <Routes>
                <Route
                    path="/"
                    element={
                        <h1>Dashboard</h1>
                    }
                />

                <Route
                    element={
                        <RoleProtectedRoute
                            allowedRoles={['admin']}
                        />
                    }
                >
                    <Route
                        path="/users"
                        element={
                            <h1>
                                User Management
                            </h1>
                        }
                    />
                </Route>
            </Routes>
        </MemoryRouter>,
    )

    expect(
        screen.getByRole('heading', {
            name: 'Dashboard',
        }),
    ).toBeInTheDocument()
})

test('redirects an unauthenticated user to login', () => {
    mockedUseAuth.mockReturnValue({
        user: null,
        status: 'unauthenticated',
        login: vi.fn(async () => { }),
        logout: vi.fn(async () => { }),
        retry: vi.fn(async () => { }),
    })

    render(
        <MemoryRouter
            initialEntries={['/users']}
        >
            <Routes>
                <Route
                    path="/login"
                    element={
                        <h1>Login</h1>
                    }
                />

                <Route
                    element={
                        <RoleProtectedRoute
                            allowedRoles={['admin']}
                        />
                    }
                >
                    <Route
                        path="/users"
                        element={
                            <h1>
                                User Management
                            </h1>
                        }
                    />
                </Route>
            </Routes>
        </MemoryRouter>,
    )

    expect(
        screen.getByRole('heading', {
            name: 'Login',
        }),
    ).toBeInTheDocument()
})