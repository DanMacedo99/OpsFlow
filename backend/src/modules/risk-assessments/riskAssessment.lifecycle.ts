import type { RiskLevel } from '../suppliers/supplier.types.js'

const reviewIntervalMonths: Record<RiskLevel, number | null> = {
    unassessed: null,
    low: 12,
    medium: 6,
    high: 3,
}

export function formatAssessmentDate(date: Date): string {
    return date.toISOString().slice(0, 10)
}

export function calculateReviewDate(
    riskLevel: RiskLevel,
    assessmentDate: Date,
): string | null {
    const intervalMonths = reviewIntervalMonths[riskLevel]

    if (intervalMonths === null) {
        return null
    }

    const reviewDate = new Date(assessmentDate)

    reviewDate.setUTCMonth(
        reviewDate.getUTCMonth() + intervalMonths,
    )

    return formatAssessmentDate(reviewDate)
}