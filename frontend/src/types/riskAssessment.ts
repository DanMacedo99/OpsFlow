import type { RiskLevel } from './supplier'

export type AssessmentDecision =
    | 'pending'
    | 'approved'
    | 'rejected'

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