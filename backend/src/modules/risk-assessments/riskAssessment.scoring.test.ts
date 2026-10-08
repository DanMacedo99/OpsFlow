import { expect, test } from 'vitest'
import { calculateAssessmentScores } from './riskAssessment.scoring.js'

test('calculates assessment scores correctly', () => {
    const result = calculateAssessmentScores([
        {
            criterionKey: 'information-security',
            score: 80,
            notes: null,
        },
        {
            criterionKey: 'data-protection',
            score: 70,
            notes: null, 
        },
        {
            criterionKey: 'regulatory-compliance',
            score: 60,
            notes: null,
        },
        {
            criterionKey: 'operational-resilience',
            score: 50,
            notes: null,
        },
        {
            criterionKey: 'financial-stability',
            score: 40,
            notes: null,
        },
    ])

    expect(result).toEqual({
        complianceScore: 62,
        riskScore: 38,
        riskLevel: 'medium',
    })
})

test.each([
    [71, 29, 'low'],
    [70, 30, 'medium'],
    [41, 59, 'medium'],
    [40, 60, 'high'],
] as const)(
    'classifies compliance score %s as risk score %s and %s risk',
    (score, expectedRiskScore, expectedRiskLevel) => {
        const result = calculateAssessmentScores([
            {
                criterionKey: 'information-security',
                score,
                notes: null,
            },
            {
                criterionKey: 'data-protection',
                score,
                notes: null,
            },
            {
                criterionKey: 'regulatory-compliance',
                score,
                notes: null,
            },
            {
                criterionKey: 'operational-resilience',
                score,
                notes: null,
            },
            {
                criterionKey: 'financial-stability',
                score,
                notes: null,
            },
        ])

        expect(result.riskScore).toBe(
            expectedRiskScore,
        )

        expect(result.riskLevel).toBe(
            expectedRiskLevel,
        )
    },
)

test('throws when a required assessment response is missing', () => {
    expect(() =>
        calculateAssessmentScores([
            {
                criterionKey: 'information-security',
                score: 80,
                notes: null,
            },
            {
                criterionKey: 'data-protection',
                score: 70,
                notes: null,
            },
            {
                criterionKey: 'regulatory-compliance',
                score: 60,
                notes: null,
            },
            {
                criterionKey: 'operational-resilience',
                score: 50,
                notes: null,
            },
        ]),
    ).toThrow(
        'Missing response for criterion: financial-stability',
    )
})

test.each([
    -1,
    101,
    NaN,
])(
    'throws when assessment score is invalid: %s',
    (invalidScore) => {
        expect(() =>
            calculateAssessmentScores([
                {
                    criterionKey: 'information-security',
                    score: invalidScore,
                    notes: null,
                },
                {
                    criterionKey: 'data-protection',
                    score: 70,
                    notes: null,
                },
                {
                    criterionKey: 'regulatory-compliance',
                    score: 60,
                    notes: null,
                },
                {
                    criterionKey: 'operational-resilience',
                    score: 50,
                    notes: null,
                },
                {
                    criterionKey: 'financial-stability',
                    score: 40,
                    notes: null,
                },
            ]),
        ).toThrow(
            'Invalid score for criterion: information-security',
        )
    },
)


