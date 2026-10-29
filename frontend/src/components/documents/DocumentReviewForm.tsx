import { useState } from 'react'

import {
    reviewDocumentAnalysis,
    type StoredDocumentReview,
} from '../../services/documentService'

type DocumentReviewFormProps = {
    supplierId: string
    analysisId: string
    currentReview: StoredDocumentReview | null
    onReviewSaved: (
        review: StoredDocumentReview,
    ) => void
}

export function DocumentReviewForm({
    supplierId,
    analysisId,
    currentReview,
    onReviewSaved,
}: DocumentReviewFormProps) {
    const [reviewStatus, setReviewStatus] =
        useState<
            | 'accepted'
            | 'rejected'
            | 'needs_follow_up'
            | ''
        >(
            currentReview?.reviewStatus ??
            '',
        )

    const [reviewComment, setReviewComment] =
        useState(
            currentReview?.reviewComment ?? '',
        )

    const [isSaving, setIsSaving] =
        useState(false)

    const [error, setError] =
        useState<string | null>(null)

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        try {
            setIsSaving(true)
            setError(null)

            if (!reviewStatus) {
                setError('Please select a review status.')
                return
            }

            const review =
                await reviewDocumentAnalysis(
                    supplierId,
                    analysisId,
                    {
                        reviewStatus,
                        reviewComment:
                            reviewComment.trim() ||
                            null,
                    },
                )

            onReviewSaved(review)
        } catch {
            setError(
                'Could not save human review.',
            )
        } finally {
            setIsSaving(false)
        }
    }


    return (
        <form
            className="document-review-form"
            onSubmit={handleSubmit}
        >
            <h5>
                {currentReview
                    ? 'Update Human Review'
                    : 'Human Review'}
            </h5>

            <label>
                Review status

                <select
                    className="document-review-select"
                    value={reviewStatus}
                    onChange={(event) =>
                        setReviewStatus(
                            event.target.value as
                            | 'accepted'
                            | 'rejected'
                            | 'needs_follow_up'
                            | '',
                        )
                    }
                    disabled={isSaving}
                >
                    <option value="" disabled>
                        Select status
                    </option>
                    <option value="accepted">
                        Accepted
                    </option>

                    <option value="rejected">
                        Rejected
                    </option>

                    <option value="needs_follow_up">
                        Needs follow-up
                    </option>
                </select>
            </label>

            <label>
                Review comment

                <textarea
                    value={reviewComment}
                    onChange={(event) =>
                        setReviewComment(
                            event.target.value,
                        )
                    }
                    maxLength={2000}
                    rows={4}
                    disabled={isSaving}
                />
            </label>

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            <button
                className="document-review-submit"
                type="submit"
                disabled={isSaving}
            >
                {isSaving
                    ? 'Saving...'
                    : currentReview
                        ? 'Update review'
                        : 'Save review'}
            </button>
        </form>
    )
}