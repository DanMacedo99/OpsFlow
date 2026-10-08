import {
    beforeEach,
    expect,
    test,
    vi,
} from 'vitest'

import {
    findRiskAssessmentById,
    findRiskAssessmentsBySupplierId,
    updateRiskAssessmentDecision,
} from './riskAssessment.repository.js'

import {
    runInTransaction,
} from '../../config/database.js'

import {
    finalizeRiskAssessment,
    listRiskAssessmentsBySupplierId,
} from './riskAssessment.service.js'

import type {
    RiskAssessment,
} from './riskAssessment.types.js'

vi.mock('./riskAssessment.repository.js', () => ({
    findRiskAssessmentById: vi.fn(),
    findRiskAssessmentsBySupplierId: vi.fn(),
    insertRiskAssessment: vi.fn(),
    updateRiskAssessmentDecision: vi.fn(),
    updateRiskAssessmentDocumentStatus: vi.fn(),
}))

vi.mock('../../config/database.js', () => ({
    runInTransaction: vi.fn(),
}))

vi.mock('../audit-logs/auditLog.repository.js', () => ({
    insertAuditLog: vi.fn(),
}))

const mockedFindRiskAssessmentById =
    vi.mocked(findRiskAssessmentById)

const mockedUpdateRiskAssessmentDecision =
    vi.mocked(updateRiskAssessmentDecision)

const mockedRunInTransaction =
    vi.mocked(runInTransaction)

const mockedFindRiskAssessmentsBySupplierId =
    vi.mocked(findRiskAssessmentsBySupplierId)

beforeEach(() => {
    vi.clearAllMocks()

    mockedRunInTransaction.mockImplementation(
        async (operation) =>
            operation({} as never),
    )
})

test('lists risk assessments for the supplier and organization', async () => {
    mockedFindRiskAssessmentsBySupplierId
        .mockResolvedValue([])

    const result =
        await listRiskAssessmentsBySupplierId(
            'SUP-001',
            'org-001',
        )

    expect(
        mockedFindRiskAssessmentsBySupplierId,
    ).toHaveBeenCalledWith(
        'SUP-001',
        'org-001',
    )

    expect(result).toEqual([])
})

test('returns not-found when the risk assessment does not exist', async () => {
    mockedFindRiskAssessmentById
        .mockResolvedValue(null)

    const result =
        await finalizeRiskAssessment(
            'SUP-001',
            'ASSESS-001',
            {
                decision: 'approved',
            },
            'org-001',
            'user-001',
        )

    expect(result).toEqual({
        outcome: 'not-found',
    })

    expect(
        mockedUpdateRiskAssessmentDecision,
    ).not.toHaveBeenCalled()
})

test('returns already-finalized when the assessment has already been finalized', async () => {
    const assessment = {
        decision: 'approved',
    } as RiskAssessment

    mockedFindRiskAssessmentById
        .mockResolvedValue(assessment)

    const result =
        await finalizeRiskAssessment(
            'SUP-001',
            'ASSESS-001',
            {
                decision: 'rejected',
            },
            'org-001',
            'user-001',
        )

    expect(result).toEqual({
        outcome: 'already-finalized',
    })

    expect(
        mockedUpdateRiskAssessmentDecision,
    ).not.toHaveBeenCalled()
})

test('does not approve an assessment when documents are not verified', async () => {
    const assessment = {
        decision: 'pending',
        documentStatus: 'pending',
    } as RiskAssessment

    mockedFindRiskAssessmentById
        .mockResolvedValue(assessment)

    const result =
        await finalizeRiskAssessment(
            'SUP-001',
            'ASSESS-001',
            {
                decision: 'approved',
            },
            'org-001',
            'user-001',
        )

    expect(result).toEqual({
        outcome: 'documents-not-verified',
    })

    expect(
        mockedUpdateRiskAssessmentDecision,
    ).not.toHaveBeenCalled()
})

test('approves a pending assessment when documents are verified', async () => {
    const assessment = {
        id: 'ASSESS-001',
        supplierId: 'SUP-001',
        decision: 'pending',
        documentStatus: 'verified',
        riskLevel: 'medium',
    } as RiskAssessment

    const updatedAssessment = {
        id: 'ASSESS-001',
        supplierId: 'SUP-001',
        decision: 'approved',
        documentStatus: 'verified',
        riskLevel: 'medium',
        assessmentDate: '2026-10-08',
        reviewDate: '2027-04-08',
    } as RiskAssessment

    mockedFindRiskAssessmentById
        .mockResolvedValue(assessment)

    mockedUpdateRiskAssessmentDecision
        .mockResolvedValue(updatedAssessment)

    const result =
        await finalizeRiskAssessment(
            'SUP-001',
            'ASSESS-001',
            {
                decision: 'approved',
            },
            'org-001',
            'user-001',
        )

    expect(
        mockedUpdateRiskAssessmentDecision,
    ).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
            assessmentId: 'ASSESS-001',
            supplierId: 'SUP-001',
            decision: 'approved',
            assessmentDate: expect.any(String),
            reviewDate: expect.any(String),
        }),
        'org-001',
    )

    expect(result).toEqual({
        outcome: 'updated',
        assessment: updatedAssessment,
    })
})