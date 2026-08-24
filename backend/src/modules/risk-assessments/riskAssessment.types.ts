import type { RiskLevel } from '../suppliers/supplier.types.js'

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

export interface AssessmentCriterion {
    key: AssessmentCriterionKey
    label: string
    weight: number
}

export interface AssessmentCriterionResponse {
    criterionKey: AssessmentCriterionKey
    score: number
    notes: string | null
}

export interface RiskAssessment {
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

export interface AssessmentScoreResult {
    complianceScore: number
    riskScore: number
    riskLevel: RiskLevel
}

export interface StoredCriterionResponse
    extends AssessmentCriterionResponse {
    weight: number
}

export interface CreateRiskAssessmentRecord
    extends AssessmentScoreResult {
    supplierId: string
    documentStatus: DocumentStatus
    notes: string | null
    responses: StoredCriterionResponse[]
}