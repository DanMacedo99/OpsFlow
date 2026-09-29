import type { RiskLevel } from './supplier'

export type AssessmentDecision =
    | 'pending'
    | 'approved'
    | 'rejected'

export type DocumentStatus =
    | 'missing'
    | 'pending'
    | 'verified'
    | 'expired'

export type AssessmentCriterionKey =
    | 'information-security'
    | 'data-protection'
    | 'regulatory-compliance'
    | 'operational-resilience'
    | 'financial-stability'

export type AssessmentCriterion = {
    key: AssessmentCriterionKey
    label: string
    weight: number
}

export type AssessmentCriterionResponse = {
    criterionKey: AssessmentCriterionKey
    score: number
    notes: string | null
}

export type CreateRiskAssessmentInput = {
    responses: AssessmentCriterionResponse[]
    documentStatus: DocumentStatus
    notes: string | null
}

export type UpdateRiskAssessmentDecisionInput = {
    decision: Exclude<
        AssessmentDecision,
        'pending'
    >
}

export type UpdateRiskAssessmentDocumentStatusInput = {
    documentStatus: DocumentStatus
}

export type RiskAssessment = {
    id: string
    supplierId: string
    riskScore: number | null
    riskLevel: RiskLevel
    complianceScore: number | null
    decision: AssessmentDecision
    documentStatus: DocumentStatus
    assessmentDate: string | null
    reviewDate: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
}

export type RiskHistoryEntry = {
    assessmentId: string
    previousRiskLevel: RiskLevel
    currentRiskLevel: RiskLevel
    previousRiskScore: number | null
    currentRiskScore: number
    complianceScore: number
    decision: AssessmentDecision
    assessmentDate: string
    recordedAt: string
}