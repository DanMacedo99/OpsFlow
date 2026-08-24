import { assessmentCriteria } from './riskAssessment.criteria.js'
import {
    findRiskAssessmentsBySupplierId,
    insertRiskAssessment,
} from './riskAssessment.repository.js'
import { calculateAssessmentScores } from './riskAssessment.scoring.js'

import type { CreateRiskAssessmentInput } from './riskAssessment.schema.js'
import type { RiskAssessment } from './riskAssessment.types.js'


export function listRiskAssessmentsBySupplierId(
    supplierId: string,
): Promise<RiskAssessment[]> {
    return findRiskAssessmentsBySupplierId(supplierId)
}

export async function createRiskAssessmentForSupplier(
    supplierId: string,
    input: CreateRiskAssessmentInput,
): Promise<RiskAssessment> {
    const scores = calculateAssessmentScores(
        input.responses,
    )

    const responsesWithWeights =
        input.responses.map((response) => {
            const criterion = assessmentCriteria.find(
                (item) =>
                    item.key ===
                    response.criterionKey,
            )

            if (!criterion) {
                throw new Error(
                    `Unknown assessment criterion: ${response.criterionKey}`,
                )
            }

            return {
                ...response,
                weight: criterion.weight,
            }
        })

    return insertRiskAssessment({
        supplierId,
        riskScore: scores.riskScore,
        riskLevel: scores.riskLevel,
        complianceScore: scores.complianceScore,
        documentStatus: input.documentStatus,
        notes: input.notes,
        responses: responsesWithWeights,
    })
}