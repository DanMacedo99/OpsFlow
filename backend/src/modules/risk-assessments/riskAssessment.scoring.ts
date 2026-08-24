import { assessmentCriteria } from './riskAssessment.criteria.js'

import type { RiskLevel } from '../suppliers/supplier.types.js'
import type {
    AssessmentCriterionResponse,
    AssessmentScoreResult,
} from './riskAssessment.types.js'

function classifyRiskLevel(
    riskScore: number,
): RiskLevel {
    if (riskScore < 30) {
        return 'low'
    }

    if (riskScore < 60) {
        return 'medium'
    }

    return 'high'
}

export function calculateAssessmentScores(
    responses: AssessmentCriterionResponse[],
): AssessmentScoreResult {
    let weightedScore = 0

    for (const criterion of assessmentCriteria) {
        const response = responses.find(
            (item) =>
                item.criterionKey === criterion.key,
        )

        if (!response) {
            throw new Error(
                `Missing response for criterion: ${criterion.key}`,
            )
        }

        if (
            !Number.isFinite(response.score) ||
            response.score < 0 ||
            response.score > 100
        ) {
            throw new Error(
                `Invalid score for criterion: ${criterion.key}`,
            )
        }

        weightedScore +=
            response.score * criterion.weight
    }

    const complianceScore = Math.round(
        weightedScore / 100,
    )

    const riskScore = 100 - complianceScore
    const riskLevel = classifyRiskLevel(riskScore)

    return {
        complianceScore,
        riskScore,
        riskLevel,
    }
}