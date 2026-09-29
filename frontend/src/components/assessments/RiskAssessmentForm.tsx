import { useState } from 'react'

import type {
    AssessmentCriterionKey,
    CreateRiskAssessmentInput,
    DocumentStatus,
} from '../../types/riskAssessment'

type RiskAssessmentFormProps = {
    onSubmit: (
        input: CreateRiskAssessmentInput,
    ) => Promise<void>
    onCancel: () => void
}

type CriterionConfig = {
    key: AssessmentCriterionKey
    label: string
    weight: number
}

const criteria: CriterionConfig[] = [
    {
        key: 'information-security',
        label: 'Information Security',
        weight: 25,
    },
    {
        key: 'data-protection',
        label: 'Data Protection',
        weight: 20,
    },
    {
        key: 'regulatory-compliance',
        label: 'Regulatory Compliance',
        weight: 20,
    },
    {
        key: 'operational-resilience',
        label: 'Operational Resilience',
        weight: 20,
    },
    {
        key: 'financial-stability',
        label: 'Financial Stability',
        weight: 15,
    },
]

function RiskAssessmentForm({
    onSubmit,
    onCancel,
}: RiskAssessmentFormProps) {
    const [scores, setScores] = useState<
        Record<AssessmentCriterionKey, number>
    >({
        'information-security': 50,
        'data-protection': 50,
        'regulatory-compliance': 50,
        'operational-resilience': 50,
        'financial-stability': 50,
    })

    const [documentStatus, setDocumentStatus] =
        useState<DocumentStatus>('pending')

    const [notes, setNotes] = useState('')

    const [isSubmitting, setIsSubmitting] =
        useState(false)

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const input: CreateRiskAssessmentInput = {
            responses: criteria.map((criterion) => ({
                criterionKey: criterion.key,
                score: scores[criterion.key],
                notes: null,
            })),
            documentStatus,
            notes: notes.trim() || null,
        }

        setIsSubmitting(true)

        try {
            await onSubmit(input)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            className="assessment-form"
            onSubmit={handleSubmit}
        >
            <div className="assessment-form-header">
                <h2>Create assessment</h2>

                <p>
                    Score each criterion from 0 to 100.
                </p>
            </div>

            <div className="assessment-criteria-grid">
                {criteria.map((criterion) => (
                    <div
                        key={criterion.key}
                        className="assessment-criterion"
                    >
                        <label htmlFor={criterion.key}>
                            {criterion.label}{' '}
                            ({criterion.weight}%)
                        </label>

                        <input
                            id={criterion.key}
                            type="number"
                            min="0"
                            max="100"
                            value={
                                scores[criterion.key]
                            }
                            onChange={(event) => {
                                const value = Number(
                                    event.target.value,
                                )

                                setScores(
                                    (
                                        currentScores,
                                    ) => ({
                                        ...currentScores,
                                        [criterion.key]:
                                            value,
                                    }),
                                )
                            }}
                            required
                        />
                    </div>
                ))}
            </div>

            <div className="assessments-field">
                <label htmlFor="document-status">
                    Document status
                </label>

                <select
                    id="document-status"
                    value={documentStatus}
                    onChange={(event) => {
                        setDocumentStatus(
                            event.target
                                .value as DocumentStatus,
                        )
                    }}
                >
                    <option value="missing">
                        Missing
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="verified">
                        Verified
                    </option>

                    <option value="expired">
                        Expired
                    </option>
                </select>
            </div>

            <div className="assessments-field">
                <label htmlFor="assessment-notes">
                    Notes
                </label>

                <textarea
                    id="assessment-notes"
                    maxLength={2000}
                    value={notes}
                    onChange={(event) => {
                        setNotes(
                            event.target.value,
                        )
                    }}
                />
            </div>

            <div className="assessment-form-actions">
                <button
                    type="submit"
                    className="assessments-primary-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Creating...'
                        : 'Create assessment'}
                </button>

                <button
                    type="button"
                    className="assessments-secondary-button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default RiskAssessmentForm