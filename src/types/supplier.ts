export type RiskLevel = 'unassessed' | 'low' | 'medium' | 'high'



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
    lastAssessmentDate: string | null
}

export type NewSupplierInput = {
    name: string
    category: string
    country: string
}