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

import RiskAssessmentForm from './RiskAssessmentForm'

test('renders the assessment form with default values', () => {
    render(
        <RiskAssessmentForm
            onSubmit={vi.fn(async () => { })}
            onCancel={vi.fn()}
        />,
    )

    expect(
        screen.getByRole('heading', {
            name: 'Create assessment',
        }),
    ).toBeInTheDocument()

    expect(
        screen.getByLabelText(
            'Information Security (25%)',
        ),
    ).toHaveValue(50)

    expect(
        screen.getByLabelText(
            'Data Protection (20%)',
        ),
    ).toHaveValue(50)

    expect(
        screen.getByLabelText(
            'Regulatory Compliance (20%)',
        ),
    ).toHaveValue(50)

    expect(
        screen.getByLabelText(
            'Operational Resilience (20%)',
        ),
    ).toHaveValue(50)

    expect(
        screen.getByLabelText(
            'Financial Stability (15%)',
        ),
    ).toHaveValue(50)

    expect(
        screen.getByLabelText(
            'Document status',
        ),
    ).toHaveValue('pending')

    expect(
        screen.getByLabelText('Notes'),
    ).toHaveValue('')
})

test('submits the assessment data entered by the user', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(async () => { })

    render(
        <RiskAssessmentForm
            onSubmit={onSubmit}
            onCancel={vi.fn()}
        />,
    )

    const informationSecurity =
        screen.getByLabelText(
            'Information Security (25%)',
        )

    await user.clear(informationSecurity)
    await user.type(
        informationSecurity,
        '80',
    )

    await user.selectOptions(
        screen.getByLabelText(
            'Document status',
        ),
        'verified',
    )

    await user.type(
        screen.getByLabelText('Notes'),
        'Supplier documentation reviewed.',
    )

    await user.click(
        screen.getByRole('button', {
            name: 'Create assessment',
        }),
    )

    expect(onSubmit).toHaveBeenCalledWith({
        responses: [
            {
                criterionKey:
                    'information-security',
                score: 80,
                notes: null,
            },
            {
                criterionKey:
                    'data-protection',
                score: 50,
                notes: null,
            },
            {
                criterionKey:
                    'regulatory-compliance',
                score: 50,
                notes: null,
            },
            {
                criterionKey:
                    'operational-resilience',
                score: 50,
                notes: null,
            },
            {
                criterionKey:
                    'financial-stability',
                score: 50,
                notes: null,
            },
        ],
        documentStatus: 'verified',
        notes:
            'Supplier documentation reviewed.',
    })
})

test('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
        <RiskAssessmentForm
            onSubmit={vi.fn(async () => {})}
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