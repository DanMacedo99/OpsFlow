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
import { runInTransaction } from '../../config/database.js'
import { insertAuditLog } from '../audit-logs/auditLog.repository.js'

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
    actorUserId: string,
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

    return runInTransaction(async (client) => {
        const assessment =
            await insertRiskAssessment(
                client,
                {
                    supplierId,
                    riskScore: scores.riskScore,
                    riskLevel: scores.riskLevel,
                    complianceScore:
                        scores.complianceScore,
                    documentStatus:
                        input.documentStatus,
                    notes: input.notes,
                    responses: responsesWithWeights,
                },
                organizationId,
            )

        if (!assessment) {
            return null
        }

        await insertAuditLog(client, {
            organizationId,
            actorUserId,
            action: 'risk_assessment.created',
            entityType: 'risk_assessment',
            entityId: assessment.id,
            metadata: {
                supplierId: assessment.supplierId,
                riskScore: assessment.riskScore,
                riskLevel: assessment.riskLevel,
                complianceScore:
                    assessment.complianceScore,
                documentStatus:
                    assessment.documentStatus,
                responseCount:
                    responsesWithWeights.length,
            },
        })

        return assessment
    })
}

export async function finalizeRiskAssessment(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDecisionInput,
    organizationId: string,
    actorUserId: string,
): Promise<FinalizeRiskAssessmentResult> {
    return runInTransaction<FinalizeRiskAssessmentResult>(
        async (client) => {
            const assessment = await findRiskAssessmentById(
                client,
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
                await updateRiskAssessmentDecision(
                    client,
                    {
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

            await insertAuditLog(client, {
                organizationId,
                actorUserId,
                action:
                    'risk_assessment.decision_updated',
                entityType: 'risk_assessment',
                entityId: updatedAssessment.id,
                metadata: {
                    supplierId,
                    previousDecision:
                        assessment.decision,
                    newDecision:
                        updatedAssessment.decision,
                    riskLevel:
                        updatedAssessment.riskLevel,
                    documentStatus:
                        updatedAssessment.documentStatus,
                    assessmentDate:
                        updatedAssessment.assessmentDate,
                    reviewDate:
                        updatedAssessment.reviewDate,
                },
            })


            return {
                outcome: 'updated',
                assessment: updatedAssessment,
            }
        }
    )
}

export function changeRiskAssessmentDocumentStatus(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDocumentStatusInput,
    organizationId: string,
    actorUserId: string,
): Promise<RiskAssessment | null> {
    return runInTransaction<RiskAssessment | null>(
        async (client) => {
            const currentAssessment =
                await findRiskAssessmentById(
                    client,
                    supplierId,
                    assessmentId,
                    organizationId,
                )

            if (!currentAssessment) {
                return null
            }

            if (
                currentAssessment.documentStatus ===
                input.documentStatus
            ) {
                return currentAssessment
            }

            const updatedAssessment =
                await updateRiskAssessmentDocumentStatus(
                    client,
                    {
                        supplierId,
                        assessmentId,
                        documentStatus:
                            input.documentStatus,
                    },
                    organizationId,
                )

            if (!updatedAssessment) {
                throw new Error(
                    'Risk assessment disappeared during the document status update.',
                )
            }

            await insertAuditLog(client, {
                organizationId,
                actorUserId,
                action:
                    'risk_assessment.document_status_updated',
                entityType: 'risk_assessment',
                entityId: updatedAssessment.id,
                metadata: {
                    supplierId,
                    previousDocumentStatus:
                        currentAssessment.documentStatus,
                    newDocumentStatus:
                        updatedAssessment.documentStatus,
                },
            })

            return updatedAssessment
        },
    )
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