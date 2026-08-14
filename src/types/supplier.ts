export type RiskLevel = 'low' | 'medium' | 'high'

export type AssessmentStatus =
    | 'approved'
    | 'pending'
    | 'review-required'

export type Supplier = {
    id: string
    name: string
    category: string
    country: string
    riskLevel: RiskLevel
    assessmentStatus: AssessmentStatus
    complianceScore: number
    lastAssessmentDate: string
}