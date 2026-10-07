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

import SupplierFilters from './SupplierFilters'

test('calls onSearchChange when the user types in the search field', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()

    render(
        <SupplierFilters
            searchTerm=""
            riskFilter="all"
            onSearchChange={onSearchChange}
            onRiskFilterChange={vi.fn()}
            onClear={vi.fn()}
        />,
    )

    await user.type(
        screen.getByLabelText('Search suppliers'),
        'Acme',
    )

    expect(onSearchChange).toHaveBeenCalled()
})

test('sends the typed search value to onSearchChange', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()

    render(
        <SupplierFilters
            searchTerm=""
            riskFilter="all"
            onSearchChange={onSearchChange}
            onRiskFilterChange={vi.fn()}
            onClear={vi.fn()}
        />,
    )

    await user.type(
        screen.getByLabelText('Search suppliers'),
        'A',
    )

    expect(
        onSearchChange,
    ).toHaveBeenCalledWith('A')
})

test('calls onRiskFilterChange when the user selects a risk level', async () => {
    const user = userEvent.setup()
    const onRiskFilterChange = vi.fn()

    render(
        <SupplierFilters
            searchTerm=""
            riskFilter="all"
            onSearchChange={vi.fn()}
            onRiskFilterChange={onRiskFilterChange}
            onClear={vi.fn()}
        />,
    )

    await user.selectOptions(
        screen.getByLabelText('Risk level'),
        'high',
    )

    expect(
        onRiskFilterChange,
    ).toHaveBeenCalledWith('high')
})

test('calls onClear when clear filters is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
        <SupplierFilters
            searchTerm="Acme"
            riskFilter="all"
            onSearchChange={vi.fn()}
            onRiskFilterChange={vi.fn()}
            onClear={onClear}
        />,
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Clear filters',
        }),
    )

    expect(onClear).toHaveBeenCalledOnce()
})

test('does not show clear filters when no filter is active', () => {
    render(
        <SupplierFilters
            searchTerm=""
            riskFilter="all"
            onSearchChange={vi.fn()}
            onRiskFilterChange={vi.fn()}
            onClear={vi.fn()}
        />,
    )

    expect(
        screen.queryByRole('button', {
            name: 'Clear filters',
        }),
    ).not.toBeInTheDocument()
})