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

export interface UpdateRiskAssessmentDecisionRecord {
    assessmentId: string
    supplierId: string
    decision: Exclude<AssessmentDecision, 'pending'>
    assessmentDate: string
    reviewDate: string | null
}

export interface UpdateRiskAssessmentDocumentStatusRecord {
    assessmentId: string
    supplierId: string
    documentStatus: DocumentStatus
}

export type FinalizeRiskAssessmentResult =
    | {
        outcome: 'updated'
        assessment: RiskAssessment
    }
    | {
        outcome: 'not-found'
    }
    | {
        outcome: 'already-finalized'
    }
    | {
        outcome: 'documents-not-verified'
    }


export interface RiskHistoryEntry {
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