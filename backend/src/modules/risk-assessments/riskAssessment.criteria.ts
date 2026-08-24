import type { AssessmentCriterion } from './riskAssessment.types.js'

export const assessmentCriteria: AssessmentCriterion[] = [
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