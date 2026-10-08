import { expect, test } from 'vitest'
import {
    calculateReviewDate,
    formatAssessmentDate,
} from './riskAssessment.lifecycle.js'

test.each([
    ['low', '2027-01-15'],
    ['medium', '2026-07-15'],
    ['high', '2026-04-15'],
] as const)(
    'calculates the review date for %s risk',
    (riskLevel, expectedReviewDate) => {
        const assessmentDate =
            new Date('2026-01-15T10:00:00.000Z')

        const result = calculateReviewDate(
            riskLevel,
            assessmentDate,
        )

        expect(result).toBe(expectedReviewDate)
    },
)

test('returns null review date for unassessed risk', () => {
    const assessmentDate =
        new Date('2026-01-15T10:00:00.000Z')

    const result = calculateReviewDate(
        'unassessed',
        assessmentDate,
    )

    expect(result).toBeNull()
})

test('formats assessment date as YYYY-MM-DD', () => {
    const date =
        new Date('2026-08-25T18:45:30.000Z')

    const result = formatAssessmentDate(date)

    expect(result).toBe('2026-08-25')
})

