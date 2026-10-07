import {
    MemoryRouter,
    Route,
    Routes,
} from 'react-router-dom'

import userEvent from '@testing-library/user-event'

import {
    render,
    screen,
} from '@testing-library/react'

import {
    expect,
    test,
    vi,
} from 'vitest'

import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

test('shows a loading message while checking the session', () => {
    mockedUseAuth.mockReturnValue({
        user: null,
        status: 'loading',
        login: vi.fn(async () => { }),
        logout: vi.fn(async () => { }),
        retry: vi.fn(async () => { }),
    })

    render(
        <MemoryRouter>
            <Routes>
                <Route
                    element={<ProtectedRoute />}
                >
                    <Route
                        path="/"
                        element={
                            <h1>Dashboard</h1>
                        }
                    />
                </Route>
            </Routes>
        </MemoryRouter>,
    )

    expect(
        screen.getByRole('status'),
    ).toHaveTextContent(
        'Checking your session...',
    )
})


test('shows an error and retries the session check', async () => {
    const user = userEvent.setup()
    const retry = vi.fn(async () => { })

    mockedUseAuth.mockReturnValue({
        user: null,
        status: 'error',
        login: vi.fn(async () => { }),
        logout: vi.fn(async () => { }),
        retry,
    })

    render(
        <MemoryRouter>
            <Routes>
                <Route
                    element={<ProtectedRoute />}
                >
                    <Route
                        path="/"
                        element={
                            <h1>Dashboard</h1>
                        }
                    />
                </Route>
            </Routes>
        </MemoryRouter>,
    )

    expect(
        screen.getByRole('heading', {
            name: 'Unable to load your session',
        }),
    ).toBeInTheDocument()

    await user.click(
        screen.getByRole('button', {
            name: 'Try again',
        }),
    )

    expect(retry).toHaveBeenCalledOnce()
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
            initialEntries={['/']}
        >
            <Routes>
                <Route
                    path="/login"
                    element={
                        <h1>Login</h1>
                    }
                />

                <Route
                    element={<ProtectedRoute />}
                >
                    <Route
                        path="/"
                        element={
                            <h1>Dashboard</h1>
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

test('renders the protected content for an authenticated user', () => {
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
        <MemoryRouter>
            <Routes>
                <Route
                    element={<ProtectedRoute />}
                >
                    <Route
                        path="/"
                        element={
                            <h1>Dashboard</h1>
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