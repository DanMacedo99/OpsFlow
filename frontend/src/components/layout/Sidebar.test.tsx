import {
    MemoryRouter,
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

import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

test('shows admin navigation items for an admin user', () => {
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
            <Sidebar />
        </MemoryRouter>,
    )

    expect(
        screen.getByRole('link', {
            name: 'User Management',
        }),
    ).toBeInTheDocument()

    expect(
        screen.getByRole('link', {
            name: 'Audit Logs',
        }),
    ).toBeInTheDocument()
})

test('hides admin navigation items from a viewer', () => {
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
        <MemoryRouter>
            <Sidebar />
        </MemoryRouter>,
    )

    expect(
        screen.queryByRole('link', {
            name: 'User Management',
        }),
    ).not.toBeInTheDocument()

    expect(
        screen.queryByRole('link', {
            name: 'Audit Logs',
        }),
    ).not.toBeInTheDocument()
})

test('calls logout when the sign out button is clicked', async () => {
    const user = userEvent.setup()
    const logout = vi.fn(async () => {})

    mockedUseAuth.mockReturnValue({
        user: {
            id: 'user-1',
            organizationId: 'org-1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
        },
        status: 'authenticated',
        login: vi.fn(async () => {}),
        logout,
        retry: vi.fn(async () => {}),
    })

    render(
        <MemoryRouter>
            <Sidebar />
        </MemoryRouter>,
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Sign out',
        }),
    )

    expect(logout).toHaveBeenCalledOnce()
})