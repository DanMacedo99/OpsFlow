import {
    render,
    screen,
    within,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import {
    beforeEach,
    expect,
    test,
    vi,
} from 'vitest'

import SuppliersPage from './SuppliersPage'

import {
    createSupplier,
    deleteSupplier,
    getSuppliers,
    updateSupplier,
} from '../services/supplierService'

import {
    getSupplierRiskHistory,
} from '../services/riskAssessmentService'

import {
    useAuth,
} from '../hooks/useAuth'

import type {
    Supplier,
} from '../types/supplier'

vi.mock('../services/supplierService', () => ({
    getSuppliers: vi.fn(),
    createSupplier: vi.fn(),
    updateSupplier: vi.fn(),
    deleteSupplier: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}))

vi.mock('../services/riskAssessmentService', () => ({
    getSupplierRiskHistory: vi.fn(),
}))

const mockedUpdateSupplier =
    vi.mocked(updateSupplier)

const mockedGetSupplierRiskHistory =
    vi.mocked(getSupplierRiskHistory)

const mockedGetSuppliers =
    vi.mocked(getSuppliers)

const mockedUseAuth =
    vi.mocked(useAuth)

const mockedCreateSupplier =
    vi.mocked(createSupplier)    

const mockedDeleteSupplier =
    vi.mocked(deleteSupplier)

beforeEach(() => {
    vi.clearAllMocks()

    mockedGetSupplierRiskHistory.mockResolvedValue([])
})

const suppliers = [
    {
        id: 'SUP-002',
        name: 'Bravo Ltd',
        category: 'Logistics',
        country: 'Ireland',
        riskLevel: 'high',
        assessmentStatus: 'pending',
        complianceScore: 55,
        lastAssessmentDate: '2026-09-20',
    },
    {
        id: 'SUP-001',
        name: 'Alpha Ltd',
        category: 'Technology',
        country: 'Ireland',
        riskLevel: 'low',
        assessmentStatus: 'approved',
        complianceScore: 90,
        lastAssessmentDate: '2026-09-10',
    },
] satisfies Supplier[]

const newSupplier = {
    id: 'SUP-003',
    name: 'Charlie Ltd',
    category: 'Finance',
    country: 'Ireland',
    riskLevel: 'unassessed',
    assessmentStatus: 'pending',
    complianceScore: 0,
    lastAssessmentDate: null,
} satisfies Supplier

const updatedSupplier = {
    id: 'SUP-001',
    name: 'Alpha Systems',
    category: 'Software',
    country: 'Ireland',
    riskLevel: 'low',
    assessmentStatus: 'approved',
    complianceScore: 90,
    lastAssessmentDate: '2026-09-10',
} satisfies Supplier

test('sorts suppliers by name when the supplier column is clicked', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockResolvedValue(
        suppliers,
    )

    render(<SuppliersPage />)

    await screen.findByRole('button', {
        name: 'Alpha Ltd',
    })

    let rows = screen.getAllByRole('row')

    expect(
        within(rows[1]).getByRole(
            'button',
            {
                name: 'Alpha Ltd',
            },
        ),
    ).toBeInTheDocument()

    await user.click(
        screen.getByRole('button', {
            name: 'Supplier',
        }),
    )

    rows = screen.getAllByRole('row')

    expect(
        within(rows[1]).getByRole(
            'button',
            {
                name: 'Bravo Ltd',
            },
        ),
    ).toBeInTheDocument()
})

test('filters suppliers by search term', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockResolvedValue(
        suppliers,
    )

    render(<SuppliersPage />)

    await screen.findByRole('button', {
        name: 'Alpha Ltd',
    })

    const searchInput = screen.getByRole(
        'searchbox',
        {
            name: 'Search suppliers',
        },
    )

    await user.type(
        searchInput,
        'Bravo',
    )

    expect(
        screen.queryByRole('button', {
            name: 'Alpha Ltd',
        }),
    ).not.toBeInTheDocument()

    expect(
        screen.getByRole('button', {
            name: 'Bravo Ltd',
        }),
    ).toBeInTheDocument()
})

test('filters suppliers by risk level', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockResolvedValue(
        suppliers,
    )

    render(<SuppliersPage />)

    await screen.findByRole('button', {
        name: 'Alpha Ltd',
    })

    const riskFilter =
        screen.getByRole('combobox')

    await user.selectOptions(
        riskFilter,
        'high',
    )

    expect(
        screen.queryByRole('button', {
            name: 'Alpha Ltd',
        }),
    ).not.toBeInTheDocument()

    expect(
        screen.getByRole('button', {
            name: 'Bravo Ltd',
        }),
    ).toBeInTheDocument()
})

test('creates a new supplier', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockResolvedValue(
        suppliers,
    )

    mockedCreateSupplier.mockResolvedValue(
        newSupplier,
    )

    render(<SuppliersPage />)

    await screen.findByRole('button', {
        name: 'Alpha Ltd',
    })

    await user.click(
        screen.getByRole('button', {
            name: 'Add supplier',
        }),
    )

    await user.type(
        screen.getByLabelText('Supplier name'),
        'Charlie Ltd',
    )

    await user.type(
        screen.getByLabelText('Category'),
        'Finance',
    )

    await user.type(
        screen.getByLabelText('Country'),
        'Ireland',
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Save supplier',
        }),
    )

    expect(
        mockedCreateSupplier,
    ).toHaveBeenCalledWith({
        name: 'Charlie Ltd',
        category: 'Finance',
        country: 'Ireland',
    })

    expect(
        await screen.findByRole('button', {
            name: 'Charlie Ltd',
        }),
    ).toBeInTheDocument()
})

test('updates an existing supplier', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockResolvedValue(
        suppliers,
    )

    mockedUpdateSupplier.mockResolvedValue(
        updatedSupplier,
    )

    render(<SuppliersPage />)

    await user.click(
        await screen.findByRole('button', {
            name: 'Alpha Ltd',
        }),
    )

    await user.click(
        screen.getByRole('button', {
            name: /edit/i,
        }),
    )

    const nameInput =
        screen.getByLabelText('Supplier name')

    const categoryInput =
        screen.getByLabelText('Category')

    await user.clear(nameInput)
    await user.type(
        nameInput,
        'Alpha Systems',
    )

    await user.clear(categoryInput)
    await user.type(
        categoryInput,
        'Software',
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Save changes',
        }),
    )

    expect(
        mockedUpdateSupplier,
    ).toHaveBeenCalledWith(
        expect.objectContaining({
            id: 'SUP-001',
        }),
        {
            name: 'Alpha Systems',
            category: 'Software',
            country: 'Ireland',
        },
    )

    expect(
        await screen.findByRole('button', {
            name: 'Alpha Systems',
        }),
    ).toBeInTheDocument()

    expect(
        screen.queryByRole('button', {
            name: 'Alpha Ltd',
        }),
    ).not.toBeInTheDocument()
})

test('deletes an existing supplier', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockResolvedValue(
        suppliers,
    )

    mockedDeleteSupplier.mockResolvedValue(
        undefined,
    )

    render(<SuppliersPage />)

    await user.click(
        await screen.findByRole('button', {
            name: 'Alpha Ltd',
        }),
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Delete supplier',
        }),
    )

    expect(
        screen.getByText(
            'Are you sure you want to delete Alpha Ltd?',
        ),
    ).toBeInTheDocument()

    await user.click(
        screen.getByRole('button', {
            name: 'Confirm deletion',
        }),
    )

    expect(
        mockedDeleteSupplier,
    ).toHaveBeenCalledWith('SUP-001')

    expect(
        await screen.findByText(
            'Alpha Ltd was deleted successfully.',
        ),
    ).toBeInTheDocument()

    expect(
        screen.queryByRole('button', {
            name: 'Alpha Ltd',
        }),
    ).not.toBeInTheDocument()

    expect(
        screen.getByRole('button', {
            name: 'Bravo Ltd',
        }),
    ).toBeInTheDocument()
})

test('shows loading state while suppliers are loading', () => {
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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers.mockReturnValue(
        new Promise(() => {}),
    )

    render(<SuppliersPage />)

    expect(
        screen.getByRole('status'),
    ).toHaveTextContent(
        'Loading suppliers...',
    )
})

test('shows an error and retries loading suppliers', async () => {
    const user = userEvent.setup()

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
        logout: vi.fn(async () => {}),
        retry: vi.fn(async () => {}),
    })

    mockedGetSuppliers
        .mockRejectedValueOnce(
            new Error('Request failed'),
        )
        .mockResolvedValueOnce(
            suppliers,
        )

    render(<SuppliersPage />)

    expect(
        await screen.findByRole('alert'),
    ).toHaveTextContent(
        'We could not load the suppliers. Please try again.',
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Try again',
        }),
    )

    expect(
        await screen.findByRole('button', {
            name: 'Alpha Ltd',
        }),
    ).toBeInTheDocument()

    expect(
        mockedGetSuppliers,
    ).toHaveBeenCalledTimes(2)
})