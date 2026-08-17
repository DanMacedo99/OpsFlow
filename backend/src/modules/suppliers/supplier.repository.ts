import type { Supplier } from './supplier.types.js'

const suppliers: Supplier[] = [
    {
        id: 'SUP-001',
        name: 'Northstar Logistics',
        category: 'Logistics',
        country: 'Ireland',
        riskLevel: 'high',
        assessmentStatus: 'review-required',
        complianceScore: 64,
        lastAssessmentDate: '2026-08-10',
    },
    {
        id: 'SUP-002',
        name: 'BlueWave Technologies',
        category: 'Technology',
        country: 'Germany',
        riskLevel: 'medium',
        assessmentStatus: 'pending',
        complianceScore: 78,
        lastAssessmentDate: '2026-08-08',
    },
    {
        id: 'SUP-003',
        name: 'GreenFields Packaging',
        category: 'Packaging',
        country: 'United Kingdom',
        riskLevel: 'low',
        assessmentStatus: 'approved',
        complianceScore: 96,
        lastAssessmentDate: '2026-08-04',
    },
    {
        id: 'SUP-004',
        name: 'MedCore Supplies',
        category: 'Healthcare',
        country: 'France',
        riskLevel: 'high',
        assessmentStatus: 'pending',
        complianceScore: 58,
        lastAssessmentDate: '2026-07-29',
    },
]

export function findAllSuppliers(): Promise<Supplier[]> {
    const supplierCopies = suppliers.map((supplier) => ({
        ...supplier,
    }))

    return Promise.resolve(supplierCopies)
}