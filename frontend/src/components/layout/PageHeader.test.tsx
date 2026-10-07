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

import PageHeader from './PageHeader'

test('renders the page title and action button', () => {
    render(
        <PageHeader
            eyebrow="Supplier Management"
            title="Suppliers"
            actionLabel="Add supplier"
            onAction={() => { }}
        />,
    )

    expect(
        screen.getByRole('heading', {
            name: 'Suppliers',
        }),
    ).toBeInTheDocument()

    expect(
        screen.getByRole('button', {
            name: 'Add supplier',
        }),
    ).toBeInTheDocument()
})

test('does not render the action button when showAction is false', () => {
    render(
        <PageHeader
            eyebrow="Supplier Management"
            title="Suppliers"
            actionLabel="Add supplier"
            onAction={() => { }}
            showAction={false}
        />,
    )

    expect(
        screen.queryByRole('button', {
            name: 'Add supplier',
        }),
    ).not.toBeInTheDocument()
})

test('calls onAction when the action button is clicked', async () => {
    const user = userEvent.setup()

    const onAction = vi.fn()

    render(
        <PageHeader
            eyebrow="Supplier Management"
            title="Suppliers"
            actionLabel="Add supplier"
            onAction={onAction}
        />,
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Add supplier',
        }),
    )

    expect(onAction).toHaveBeenCalledOnce()
})