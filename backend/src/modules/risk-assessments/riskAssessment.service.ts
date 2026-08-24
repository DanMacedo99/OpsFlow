import { assessmentCriteria } from './riskAssessment.criteria.js'
import {
    findRiskAssessmentById,
    findRiskAssessmentsBySupplierId,
    insertRiskAssessment,
    updateRiskAssessmentDecision,
} from './riskAssessment.repository.js'
import { calculateAssessmentScores } from './riskAssessment.scoring.js'
import {
    calculateReviewDate,
    formatAssessmentDate,
} from './riskAssessment.lifecycle.js'
import type {
    CreateRiskAssessmentInput,
    UpdateRiskAssessmentDecisionInput,
} from './riskAssessment.schema.js'
import type {
    FinalizeRiskAssessmentResult,
    RiskAssessment,
} from './riskAssessment.types.js'


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

export async function finalizeRiskAssessment(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDecisionInput,
): Promise<FinalizeRiskAssessmentResult> {
    const assessment = await findRiskAssessmentById(
        supplierId,
        assessmentId,
    )

    if (!assessment) {
        return {
            outcome: 'not-found',
        }
    }

    if (assessment.decision !== 'pending') {
        return {
            outcome: 'already-finalized',
        }
    }

    if (
        input.decision === 'approved' &&
        assessment.documentStatus !== 'verified'
    ) {
        return {
            outcome: 'documents-not-verified',
        }
    }

    const currentDate = new Date()
    const assessmentDate =
        formatAssessmentDate(currentDate)

    const reviewDate =
        input.decision === 'approved'
            ? calculateReviewDate(
                assessment.riskLevel,
                currentDate,
            )
            : null

    const updatedAssessment =
        await updateRiskAssessmentDecision({
            assessmentId,
            supplierId,
            decision: input.decision,
            assessmentDate,
            reviewDate,
        })

    if (!updatedAssessment) {
        return {
            outcome: 'already-finalized',
        }
    }

    return {
        outcome: 'updated',
        assessment: updatedAssessment,
    }
}