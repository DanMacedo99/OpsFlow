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

import SupplierForm from './SupplierForm'

test('renders the supplier form fields and actions', () => {
    render(
        <SupplierForm
            title="Add supplier"
            description="Enter supplier information."
            submitLabel="Save supplier"
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
        />,
    )

    expect(
        screen.getByRole('heading', {
            name: 'Add supplier',
        }),
    ).toBeInTheDocument()

    expect(
        screen.getByLabelText('Supplier name'),
    ).toBeInTheDocument()

    expect(
        screen.getByLabelText('Category'),
    ).toBeInTheDocument()

    expect(
        screen.getByLabelText('Country'),
    ).toBeInTheDocument()

    expect(
        screen.getByRole('button', {
            name: 'Save supplier',
        }),
    ).toBeInTheDocument()

    expect(
        screen.getByRole('button', {
            name: 'Cancel',
        }),
    ).toBeInTheDocument()
})

test('submits the entered supplier data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
        <SupplierForm
            title="Add supplier"
            description="Enter supplier information."
            submitLabel="Save supplier"
            onSubmit={onSubmit}
            onCancel={vi.fn()}
        />,
    )

    await user.type(
        screen.getByLabelText('Supplier name'),
        'Acme Ltd',
    )

    await user.type(
        screen.getByLabelText('Category'),
        'Technology',
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

    expect(onSubmit).toHaveBeenCalledWith({
        name: 'Acme Ltd',
        category: 'Technology',
        country: 'Ireland',
    })
})

test('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
        <SupplierForm
            title="Add supplier"
            description="Enter supplier information."
            submitLabel="Save supplier"
            onSubmit={vi.fn()}
            onCancel={onCancel}
        />,
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Cancel',
        }),
    )

    expect(onCancel).toHaveBeenCalledOnce()
})

test('renders initial values when editing a supplier', () => {
    render(
        <SupplierForm
            title="Edit supplier"
            description="Update supplier information."
            submitLabel="Save changes"
            initialValues={{
                name: 'Acme Ltd',
                category: 'Technology',
                country: 'Ireland',
            }}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
        />,
    )

    expect(
        screen.getByLabelText('Supplier name'),
    ).toHaveValue('Acme Ltd')

    expect(
        screen.getByLabelText('Category'),
    ).toHaveValue('Technology')

    expect(
        screen.getByLabelText('Country'),
    ).toHaveValue('Ireland')
})