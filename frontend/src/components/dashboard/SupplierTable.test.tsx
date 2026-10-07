import {
    render,
    screen,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import {
    expect,
    test,
    vi,
} from 'vitest'

import SupplierTable from './SupplierTable'

import type {
    Supplier,
} from '../../types/supplier'

const supplier = {
    id: 'SUP-001',
    name: 'Acme Ltd',
    category: 'Technology',
    country: 'Ireland',
    riskLevel: 'low',
    assessmentStatus: 'approved',
    complianceScore: 85,
    lastAssessmentDate: '2026-09-01',
} as Supplier

test('calls onSort with name when the supplier column is clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()

    render(
        <SupplierTable
            suppliers={[supplier]}
            sortKey="name"
            sortDirection="asc"
            onSort={onSort}
            onSelectSupplier={vi.fn()}
        />,
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Supplier',
        }),
    )

    expect(onSort).toHaveBeenCalledWith(
        'name',
    )
})

test.each([
    ['Risk', 'riskLevel'],
    ['Compliance', 'complianceScore'],
    ['Last assessment', 'lastAssessmentDate'],
] as const)(
    'calls onSort with %s when that column is clicked',
    async (buttonName, expectedSortKey) => {
        const user = userEvent.setup()
        const onSort = vi.fn()

        render(
            <SupplierTable
                suppliers={[supplier]}
                sortKey="name"
                sortDirection="asc"
                onSort={onSort}
                onSelectSupplier={vi.fn()}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: buttonName,
            }),
        )

        expect(onSort).toHaveBeenCalledWith(
            expectedSortKey,
        )
    },
)

test('sets aria-sort on the active sort column', () => {
    render(
        <SupplierTable
            suppliers={[supplier]}
            sortKey="riskLevel"
            sortDirection="desc"
            onSort={vi.fn()}
            onSelectSupplier={vi.fn()}
        />,
    )

    const riskHeader = screen.getByRole(
        'columnheader',
        {
            name: 'Risk',
        },
    )

    expect(riskHeader).toHaveAttribute(
        'aria-sort',
        'descending',
    )
})

test('shows an empty state when there are no suppliers', () => {
    render(
        <SupplierTable
            suppliers={[]}
            sortKey="name"
            sortDirection="asc"
            onSort={vi.fn()}
            onSelectSupplier={vi.fn()}
        />,
    )

    expect(
        screen.getByRole('heading', {
            name: 'No suppliers found',
        }),
    ).toBeInTheDocument()

    expect(
        screen.getByText(
            'Try changing the search term or risk filter.',
        ),
    ).toBeInTheDocument()
})