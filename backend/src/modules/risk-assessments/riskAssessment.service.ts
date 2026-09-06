import { assessmentCriteria } from './riskAssessment.criteria.js'
import {
    findRiskAssessmentById,
    findRiskAssessmentsBySupplierId,
    insertRiskAssessment,
    updateRiskAssessmentDecision,
    updateRiskAssessmentDocumentStatus,
} from './riskAssessment.repository.js'
import { calculateAssessmentScores } from './riskAssessment.scoring.js'
import {
    calculateReviewDate,
    formatAssessmentDate,
} from './riskAssessment.lifecycle.js'
import type {
    CreateRiskAssessmentInput,
    UpdateRiskAssessmentDecisionInput,
    UpdateRiskAssessmentDocumentStatusInput,
} from './riskAssessment.schema.js'
import type {
    FinalizeRiskAssessmentResult,
    RiskAssessment,
    RiskHistoryEntry,
} from './riskAssessment.types.js'


export function listRiskAssessmentsBySupplierId(
    supplierId: string,
    organizationId: string,
): Promise<RiskAssessment[]> {
    return findRiskAssessmentsBySupplierId(supplierId, organizationId)
}

export async function createRiskAssessmentForSupplier(
    supplierId: string,
    input: CreateRiskAssessmentInput,
    organizationId: string,
): Promise<RiskAssessment | null> {
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
    }, organizationId)
}

export async function finalizeRiskAssessment(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDecisionInput,
    organizationId: string,
): Promise<FinalizeRiskAssessmentResult> {
    const assessment = await findRiskAssessmentById(
        supplierId,
        assessmentId,
        organizationId,
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
        }, organizationId)

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

export function changeRiskAssessmentDocumentStatus(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDocumentStatusInput,
    organizationId: string,
): Promise<RiskAssessment | null> {
    return updateRiskAssessmentDocumentStatus({
        supplierId,
        assessmentId,
        documentStatus: input.documentStatus,
    }, organizationId)
}

export async function listRiskHistoryBySupplierId(
    supplierId: string,
    organizationId: string,
): Promise<RiskHistoryEntry[]> {
    const assessments =
        await findRiskAssessmentsBySupplierId(supplierId, organizationId)

    const chronologicalAssessments = [
        ...assessments,
    ].reverse()

    const history: RiskHistoryEntry[] = []

    let previousRiskLevel: RiskAssessment['riskLevel'] =
        'unassessed'

    let previousRiskScore: number | null = null

    for (const assessment of chronologicalAssessments) {
        const currentRiskScore =
            assessment.riskScore
        const complianceScore =
            assessment.complianceScore
        const assessmentDate =
            assessment.assessmentDate

        if (
            assessment.decision === 'pending' ||
            currentRiskScore === null ||
            complianceScore === null ||
            assessmentDate === null
        ) {
            continue
        }

        const riskChanged =
            previousRiskLevel !== assessment.riskLevel ||
            previousRiskScore !== currentRiskScore

        if (riskChanged) {
            history.push({
                assessmentId: assessment.id,
                previousRiskLevel,
                currentRiskLevel: assessment.riskLevel,
                previousRiskScore,
                currentRiskScore,
                complianceScore,
                decision: assessment.decision,
                assessmentDate,
                recordedAt: assessment.createdAt,
            })
        }

        previousRiskLevel = assessment.riskLevel
        previousRiskScore = currentRiskScore
    }

    return history.reverse()
}