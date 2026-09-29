import { useEffect, useState } from 'react'

import './AssessmentsPage.css'

import { getSuppliers } from '../services/supplierService'

import type { Supplier } from '../types/supplier'

import RiskAssessmentForm from '../components/assessments/RiskAssessmentForm'

import {
    createSupplierRiskAssessment,
    getSupplierRiskAssessments,
    updateRiskAssessmentDocumentStatus,
    updateRiskAssessmentDecision,
} from '../services/riskAssessmentService'

import type {
    CreateRiskAssessmentInput,
    DocumentStatus,
    RiskAssessment,
} from '../types/riskAssessment'

function AssessmentsPage() {
    const [isCreatingAssessment, setIsCreatingAssessment] =
        useState(false)

    const [feedback, setFeedback] =
        useState<string | null>(null)

    const [suppliers, setSuppliers] =
        useState<Supplier[]>([])

    const [selectedSupplierId, setSelectedSupplierId] =
        useState('')

    const [assessments, setAssessments] =
        useState<RiskAssessment[]>([])

    const [isLoadingSuppliers, setIsLoadingSuppliers] =
        useState(true)

    const [isLoadingAssessments, setIsLoadingAssessments] =
        useState(false)

    const [error, setError] =
        useState<string | null>(null)

    const [
        updatingAssessmentId,
        setUpdatingAssessmentId,
    ] = useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        async function loadSuppliers() {
            try {
                const loadedSuppliers =
                    await getSuppliers()

                if (isActive) {
                    setSuppliers(loadedSuppliers)
                }
            } catch {
                if (isActive) {
                    setError(
                        'We could not load the suppliers.',
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoadingSuppliers(false)
                }
            }
        }

        void loadSuppliers()

        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        if (!selectedSupplierId) {
            return
        }

        let isActive = true

        void getSupplierRiskAssessments(
            selectedSupplierId,
        )
            .then((loadedAssessments) => {
                if (isActive) {
                    setAssessments(
                        loadedAssessments,
                    )
                }
            })
            .catch(() => {
                if (isActive) {
                    setAssessments([])
                    setError(
                        'We could not load the assessments.',
                    )
                }
            })
            .finally(() => {
                if (isActive) {
                    setIsLoadingAssessments(false)
                }
            })

        return () => {
            isActive = false
        }
    }, [selectedSupplierId])

    async function handleAssessmentDecision(
        assessmentId: string,
        decision: 'approved' | 'rejected',
    ) {
        if (!selectedSupplierId) {
            return
        }

        setUpdatingAssessmentId(assessmentId)
        setFeedback(null)

        try {
            const updatedAssessment =
                await updateRiskAssessmentDecision(
                    selectedSupplierId,
                    assessmentId,
                    {
                        decision,
                    },
                )

            setAssessments((currentAssessments) =>
                currentAssessments.map(
                    (assessment) =>
                        assessment.id === assessmentId
                            ? updatedAssessment
                            : assessment,
                ),
            )

            setFeedback(
                `Assessment ${decision} successfully.`,
            )
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : 'Could not update assessment decision.',
            )
        } finally {
            setUpdatingAssessmentId(null)
        }
    }

    async function handleDocumentStatusChange(
        assessmentId: string,
        documentStatus: DocumentStatus,
    ) {
        if (!selectedSupplierId) {
            return
        }

        setUpdatingAssessmentId(assessmentId)
        setFeedback(null)

        try {
            const updatedAssessment =
                await updateRiskAssessmentDocumentStatus(
                    selectedSupplierId,
                    assessmentId,
                    {
                        documentStatus,
                    },
                )

            setAssessments((currentAssessments) =>
                currentAssessments.map(
                    (assessment) =>
                        assessment.id === assessmentId
                            ? updatedAssessment
                            : assessment,
                ),
            )

            setFeedback(
                'Document status updated successfully.',
            )
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : 'Could not update document status.',
            )
        } finally {
            setUpdatingAssessmentId(null)
        }
    }

    async function handleCreateAssessment(
        input: CreateRiskAssessmentInput,
    ) {
        if (!selectedSupplierId) {
            return
        }

        try {
            const newAssessment =
                await createSupplierRiskAssessment(
                    selectedSupplierId,
                    input,
                )

            setAssessments(
                (currentAssessments) => [
                    newAssessment,
                    ...currentAssessments,
                ],
            )

            setIsCreatingAssessment(false)

            setFeedback(
                'Assessment created successfully.',
            )
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : 'Could not create assessment.',
            )
        }
    }

    function formatAssessmentDate(
        date: string | null,
    ): string {
        if (!date) {
            return '—'
        }

        return new Intl.DateTimeFormat(
            'en-IE',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            },
        ).format(new Date(date))
    }

    return (
        <section className="assessments-page">
            <div className="assessments-header">
                <p className="page-eyebrow">
                    Risk and compliance
                </p>

                <h1>Assessments</h1>

                <p>
                    Review and manage supplier risk assessments.
                </p>
            </div>

            {isLoadingSuppliers ? (
                <p
                    role="status"
                    className="assessments-status"
                >
                    Loading suppliers...
                </p>
            ) : (
                <div className="assessments-controls">
                    <div className="assessments-field">
                        <label htmlFor="supplier">
                            Supplier
                        </label>

                        <select
                            id="supplier"
                            value={selectedSupplierId}
                            onChange={(event) => {
                                const supplierId =
                                    event.target.value

                                setSelectedSupplierId(
                                    supplierId,
                                )

                                setAssessments([])
                                setError(null)
                                setFeedback(null)
                                setIsCreatingAssessment(false)

                                setIsLoadingAssessments(
                                    Boolean(supplierId),
                                )
                            }}
                        >
                            <option value="">
                                Select a supplier
                            </option>

                            {suppliers.map((supplier) => (
                                <option
                                    key={supplier.id}
                                    value={supplier.id}
                                >
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSupplierId &&
                        !isCreatingAssessment && (
                            <button
                                type="button"
                                className="assessments-primary-button"
                                onClick={() => {
                                    setFeedback(null)
                                    setIsCreatingAssessment(true)
                                }}
                            >
                                Create assessment
                            </button>
                        )}
                </div>
            )}

            {feedback && (
                <p
                    role="status"
                    className="assessments-feedback"
                >
                    {feedback}
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="assessments-error"
                >
                    {error}
                </p>
            )}

            {selectedSupplierId &&
                isCreatingAssessment && (
                    <RiskAssessmentForm
                        onSubmit={
                            handleCreateAssessment
                        }
                        onCancel={() => {
                            setIsCreatingAssessment(false)
                        }}
                    />
                )}

            {selectedSupplierId &&
                isLoadingAssessments && (
                    <p
                        role="status"
                        className="assessments-status"
                    >
                        Loading assessments...
                    </p>
                )}

            {selectedSupplierId &&
                !isLoadingAssessments &&
                !error &&
                assessments.length === 0 && (
                    <p className="assessments-empty">
                        No assessments found for this supplier.
                    </p>
                )}

            {assessments.length > 0 && (
                <div className="assessment-history">
                    <h2>
                        Assessment history
                    </h2>

                    <div className="assessment-list">
                        {assessments.map(
                            (assessment) => (
                                <article
                                    key={
                                        assessment.id
                                    }
                                    className="assessment-card"
                                >
                                    <h3>
                                        {
                                            assessment.riskLevel
                                        }
                                    </h3>

                                    <p>
                                        <span>
                                            Risk score
                                        </span>

                                        <strong>
                                            {assessment.riskScore ??
                                                '—'}
                                        </strong>
                                    </p>

                                    <p>
                                        <span>
                                            Compliance
                                        </span>

                                        <strong>
                                            {assessment.complianceScore !==
                                                null
                                                ? `${assessment.complianceScore}%`
                                                : '—'}
                                        </strong>
                                    </p>

                                    <p>
                                        <span>
                                            Decision
                                        </span>

                                        <strong>
                                            {
                                                assessment.decision
                                            }
                                        </strong>
                                    </p>

                                    <div className="assessment-document-control">
                                        <label
                                            htmlFor={`document-status-${assessment.id}`}
                                        >
                                            Documents
                                        </label>

                                        <p>
                                            <span>Created</span>

                                            <strong>
                                                {formatAssessmentDate(
                                                    assessment.createdAt,
                                                )}
                                            </strong>
                                        </p>

                                        <p>
                                            <span>Last updated</span>

                                            <strong>
                                                {formatAssessmentDate(
                                                    assessment.updatedAt,
                                                )}
                                            </strong>
                                        </p>

                                        <p>
                                            <span>Decision date</span>

                                            <strong>
                                                {formatAssessmentDate(
                                                    assessment.assessmentDate,
                                                )}
                                            </strong>
                                        </p>

                                        <p>
                                            <span>Next review</span>

                                            <strong>
                                                {formatAssessmentDate(
                                                    assessment.reviewDate,
                                                )}
                                            </strong>
                                        </p>

                                        <label>
                                            Documents Status
                                        </label>

                                        <select
                                            id={`document-status-${assessment.id}`}
                                            value={assessment.documentStatus}
                                            disabled={
                                                updatingAssessmentId ===
                                                assessment.id
                                            }
                                            onChange={(event) => {
                                                void handleDocumentStatusChange(
                                                    assessment.id,
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
                                    {assessment.decision === 'pending' && (
                                        <div className="assessment-decision-actions">
                                            <button
                                                type="button"
                                                className="assessment-approve-button"
                                                disabled={
                                                    updatingAssessmentId ===
                                                    assessment.id
                                                }
                                                onClick={() => {
                                                    void handleAssessmentDecision(
                                                        assessment.id,
                                                        'approved',
                                                    )
                                                }}
                                            >
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                className="assessment-reject-button"
                                                disabled={
                                                    updatingAssessmentId ===
                                                    assessment.id
                                                }
                                                onClick={() => {
                                                    void handleAssessmentDecision(
                                                        assessment.id,
                                                        'rejected',
                                                    )
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ),
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

export default AssessmentsPage