import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import { createDocument, analyzeStoredDocument, saveDocumentReview, } from './document.service.js'
import {
    findDocumentByHash,
    findDocumentById,
    insertDocument,
    insertDocumentAnalysis,
    findDocumentAnalysisById,
    findDocumentReview,
    upsertDocumentReview,
} from './document.repository.js'
import { extractPdfText } from './document.parser.js'
import { saveDocument, readDocument } from './document.storage.js'
import { insertAuditLog } from '../audit-logs/auditLog.repository.js'

import {
    qualifyDocumentContext,
} from './document.qualification.service.js'

import {
    getSupplierById,
} from '../suppliers/supplier.service.js'

import {
    analyzeDocumentContext,
} from './document.ai.service.js'

vi.mock(
    './document.qualification.service.js',
)

vi.mock(
    './document.ai.service.js',
)

vi.mock(
    '../suppliers/supplier.service.js',
)

vi.mock('./document.parser.js')

vi.mock('./document.storage.js')

vi.mock('./document.repository.js')

vi.mock('../audit-logs/auditLog.repository.js')

vi.mock('../../config/database.js', () => ({
    runInTransaction: vi.fn(
        async (
            callback: (
                client: object,
            ) => Promise<unknown>,
        ) => callback({}),
    ),
}))

describe('createDocument', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(
            extractPdfText,
        ).mockResolvedValue([
            {
                pageNumber: 1,
                text:
                    'Meridian Circuit Works Ltd. compliance information.',
            },
        ])

        vi.mocked(
            getSupplierById,
        ).mockResolvedValue({
            id: 'SUP-123',
            name: 'Meridian Circuit Works Ltd.',
            category: "Electronics",
            country: "USA",
            riskLevel: "low",
            assessmentStatus: "pending",
            complianceScore: 85,
            lastAssessmentDate: null,
        })

        vi.mocked(
            findDocumentByHash,
        ).mockResolvedValue(null)

        vi.mocked(
            saveDocument,
        ).mockResolvedValue(
            'documents/test-document.pdf',
        )

        vi.mocked(
            insertDocument,
        ).mockResolvedValue(
            'document-123',
        )

        vi.mocked(
            insertAuditLog,
        ).mockResolvedValue({
            id: 'audit-123',
            organizationId: 'org-123',
            actorUserId: 'user-123',
            action: 'document.uploaded',
            entityType: 'document',
            entityId: 'document-123',
            metadata: {
                supplierId: 'SUP-123',
            },
            createdAt: new Date().toISOString(),
        })

        vi.mocked(
            findDocumentById,
        ).mockResolvedValue({
            id: 'document-123',
            organizationId: 'org-123',
            supplierId: 'SUP-123',
            originalName: 'compliance.pdf',
            storageKey:
                'documents/test-document.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 1024,
            createdAt: new Date(),
        })

        vi.mocked(
            readDocument,
        ).mockResolvedValue(
            Buffer.from(
                '%PDF-1.4 test document',
            ),
        )

        vi.mocked(
            qualifyDocumentContext,
        ).mockResolvedValue(
            mockQualification,
        )

        vi.mocked(
            analyzeDocumentContext,
        ).mockResolvedValue(
            mockAnalysis,
        )

        vi.mocked(
            insertDocumentAnalysis,
        ).mockResolvedValue(
            'analysis-123',
        )
    })

    it('creates a document and records the upload audit log', async () => {
        const documentId =
            await createDocument({
                organizationId: 'org-123',
                supplierId: 'SUP-123',
                actorUserId: 'user-123',
                originalName:
                    'compliance.pdf',
                mimeType:
                    'application/pdf',
                sizeBytes: 1024,
                buffer: Buffer.from(
                    '%PDF-1.4 test document',
                ),
            })

        expect(documentId).toBe(
            'document-123',
        )

        expect(
            insertDocument,
        ).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                organizationId:
                    'org-123',
                supplierId:
                    'SUP-123',
                originalName:
                    'compliance.pdf',
                mimeType:
                    'application/pdf',
                sizeBytes: 1024,
            }),
        )

        expect(
            insertAuditLog,
        ).toHaveBeenCalledWith(
            expect.anything(),
            {
                organizationId:
                    'org-123',
                actorUserId:
                    'user-123',
                action:
                    'document.uploaded',
                entityType:
                    'document',
                entityId:
                    'document-123',
                metadata: {
                    supplierId:
                        'SUP-123',
                    originalName:
                        'compliance.pdf',
                    mimeType:
                        'application/pdf',
                    sizeBytes: 1024,
                },
            },
        )
    })

    it('rejects a duplicate document before saving it', async () => {
        vi.mocked(
            findDocumentByHash,
        ).mockResolvedValue(
            'existing-document-123',
        )

        await expect(
            createDocument({
                organizationId: 'org-123',
                supplierId: 'SUP-123',
                actorUserId: 'user-123',
                originalName: 'compliance.pdf',
                mimeType: 'application/pdf',
                sizeBytes: 1024,
                buffer: Buffer.from(
                    '%PDF-1.4 test document',
                ),
            }),
        ).rejects.toMatchObject({
            statusCode: 409,
            code: 'DUPLICATE_DOCUMENT',
        })

        expect(
            saveDocument,
        ).not.toHaveBeenCalled()

        expect(
            insertDocument,
        ).not.toHaveBeenCalled()

        expect(
            insertAuditLog,
        ).not.toHaveBeenCalled()
    })

    it('rejects a PDF without extractable text', async () => {
        vi.mocked(
            extractPdfText,
        ).mockResolvedValue([
            {
                pageNumber: 1,
                text: '   ',
            },
        ])

        await expect(
            createDocument({
                organizationId: 'org-123',
                supplierId: 'SUP-123',
                actorUserId: 'user-123',
                originalName: 'empty.pdf',
                mimeType: 'application/pdf',
                sizeBytes: 1024,
                buffer: Buffer.from(
                    '%PDF-1.4 empty document',
                ),
            }),
        ).rejects.toMatchObject({
            statusCode: 400,
            code: 'PDF_TEXT_NOT_FOUND',
        })

        expect(
            findDocumentByHash,
        ).not.toHaveBeenCalled()

        expect(
            saveDocument,
        ).not.toHaveBeenCalled()

        expect(
            insertDocument,
        ).not.toHaveBeenCalled()

        expect(
            insertAuditLog,
        ).not.toHaveBeenCalled()
    })

    const mockQualification = {
        detectedSupplier:
            'Meridian Circuit Works Ltd.',
        supplierMatch: 'match' as const,
        relevance: 'relevant' as const,
        documentType:
            'Supplier Compliance Report',
        reason:
            'The document contains supplier compliance information.',
    }

    const mockAnalysis = {
        supplier:
            'Meridian Circuit Works Ltd.',
        overallStatus:
            'requires_review',
        summary:
            'The supplier presents some compliance risks.',
        risks: [
            {
                title:
                    'Expired certification',
                severity: 'high' as const,
                description:
                    'A certification appears to be expired.',
                pages: [2],
            },
        ],
        inconsistencies: [],
        missingEvidence: [],
    }


    describe('analyzeStoredDocument', () => {
        it('completes and persists a valid document analysis', async () => {
            const result =
                await analyzeStoredDocument(
                    'document-123',
                    'SUP-123',
                    'org-123',
                    'user-123',
                )

            expect(result.status).toBe(
                'completed',
            )

            expect(
                insertDocumentAnalysis,
            ).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    organizationId:
                        'org-123',
                    supplierId:
                        'SUP-123',
                    documentId:
                        'document-123',
                    analysis:
                        mockAnalysis,
                }),
            )

            expect(
                insertAuditLog,
            ).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    organizationId:
                        'org-123',
                    actorUserId:
                        'user-123',
                    action:
                        'document_analysis.completed',
                    entityType:
                        'document_analysis',
                    entityId:
                        'analysis-123',
                }),
            )

            expect(result).toMatchObject({
                status: 'completed',
                qualification:
                    mockQualification,
                analysisId:
                    'analysis-123',
                analysis:
                    mockAnalysis,
            })
        })

        it('rejects a document that does not match the supplier', async () => {
            vi.mocked(
                qualifyDocumentContext,
            ).mockResolvedValue({
                detectedSupplier:
                    'Another Company Ltd.',
                supplierMatch:
                    'mismatch',
                relevance:
                    'relevant',
                documentType:
                    'Supplier Compliance Report',
                reason:
                    'The document belongs to another supplier.',
            })

            const result =
                await analyzeStoredDocument(
                    'document-123',
                    'SUP-123',
                    'org-123',
                    'user-123',
                )

            expect(result).toMatchObject({
                status: 'rejected',
                qualification: {
                    detectedSupplier:
                        'Another Company Ltd.',
                    supplierMatch:
                        'mismatch',
                    relevance:
                        'relevant',
                },
            })

            expect(
                analyzeDocumentContext,
            ).not.toHaveBeenCalled()

            expect(
                insertDocumentAnalysis,
            ).not.toHaveBeenCalled()

            expect(
                insertAuditLog,
            ).not.toHaveBeenCalled()
        })

        it('rejects a PDF without extractable text', async () => {
            vi.mocked(
                extractPdfText,
            ).mockResolvedValue([
                {
                    pageNumber: 1,
                    text: '   ',
                },
            ])

            await expect(
                createDocument({
                    organizationId: 'org-123',
                    supplierId: 'SUP-123',
                    actorUserId: 'user-123',
                    originalName: 'empty.pdf',
                    mimeType: 'application/pdf',
                    sizeBytes: 1024,
                    buffer: Buffer.from(
                        '%PDF-1.4 empty document',
                    ),
                }),
            ).rejects.toMatchObject({
                statusCode: 400,
                code: 'PDF_TEXT_NOT_FOUND',
            })

            expect(
                findDocumentByHash,
            ).not.toHaveBeenCalled()

            expect(
                saveDocument,
            ).not.toHaveBeenCalled()

            expect(
                insertDocument,
            ).not.toHaveBeenCalled()

            expect(
                insertAuditLog,
            ).not.toHaveBeenCalled()
        })

        it('rejects a document that does not match the supplier', async () => {
            vi.mocked(
                qualifyDocumentContext,
            ).mockResolvedValue({
                detectedSupplier:
                    'Another Company Ltd.',
                supplierMatch:
                    'mismatch',
                relevance:
                    'relevant',
                documentType:
                    'Supplier Compliance Report',
                reason:
                    'The document belongs to another supplier.',
            })

            const result =
                await analyzeStoredDocument(
                    'document-123',
                    'SUP-123',
                    'org-123',
                    'user-123',
                )

            expect(result).toMatchObject({
                status: 'rejected',
                qualification: {
                    detectedSupplier:
                        'Another Company Ltd.',
                    supplierMatch:
                        'mismatch',
                    relevance:
                        'relevant',
                },
            })

            expect(
                analyzeDocumentContext,
            ).not.toHaveBeenCalled()

            expect(
                insertDocumentAnalysis,
            ).not.toHaveBeenCalled()

            expect(
                insertAuditLog,
            ).not.toHaveBeenCalled()
        })

    })

    describe('saveDocumentReview', () => {
        it('creates the first human review and records reviewed audit action', async () => {
            vi.mocked(
                findDocumentAnalysisById,
            ).mockResolvedValue(
                {
                    id: 'analysis-123',
                } as NonNullable<
                    Awaited<
                        ReturnType<
                            typeof findDocumentAnalysisById
                        >
                    >
                >,
            )

            vi.mocked(
                findDocumentReview,
            ).mockResolvedValue(null)

            const savedReview = {
                id: 'review-123',
                analysisId: 'analysis-123',
                reviewStatus: 'accepted' as const,
                reviewedBy: 'user-123',
                reviewComment:
                    'Analysis reviewed and accepted.',
                reviewedAt: new Date(
                    '2026-11-02T10:00:00Z',
                ),
            }

            vi.mocked(
                upsertDocumentReview,
            ).mockResolvedValue(savedReview)

            const result =
                await saveDocumentReview(
                    'analysis-123',
                    'SUP-123',
                    'org-123',
                    'user-123',
                    {
                        reviewStatus: 'accepted',
                        reviewComment:
                            'Analysis reviewed and accepted.',
                    },
                )

            expect(result).toEqual(
                savedReview,
            )

            expect(
                upsertDocumentReview,
            ).toHaveBeenCalledWith(
                expect.anything(),
                {
                    organizationId:
                        'org-123',
                    supplierId:
                        'SUP-123',
                    analysisId:
                        'analysis-123',
                    reviewStatus:
                        'accepted',
                    reviewedBy:
                        'user-123',
                    reviewComment:
                        'Analysis reviewed and accepted.',
                },
            )

            expect(
                insertAuditLog,
            ).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    organizationId:
                        'org-123',
                    actorUserId:
                        'user-123',
                    action:
                        'document_analysis.reviewed',
                    entityType:
                        'document_analysis',
                    entityId:
                        'analysis-123',
                    metadata:
                        expect.objectContaining({
                            reviewId:
                                'review-123',
                            previousStatus:
                                null,
                            newStatus:
                                'accepted',
                            previousComment:
                                null,
                            newComment:
                                'Analysis reviewed and accepted.',
                        }),
                }),
            )
        })

        it('updates an existing human review and records review_updated audit action', async () => {
            vi.mocked(
                findDocumentAnalysisById,
            ).mockResolvedValue(
                {
                    id: 'analysis-123',
                } as NonNullable<
                    Awaited<
                        ReturnType<
                            typeof findDocumentAnalysisById
                        >
                    >
                >,
            )

            vi.mocked(
                findDocumentReview,
            ).mockResolvedValue({
                id: 'review-123',
                analysisId:
                    'analysis-123',
                reviewStatus:
                    'rejected',
                reviewedBy:
                    'user-123',
                reviewComment:
                    'Evidence was insufficient.',
                reviewedAt:
                    new Date(
                        '2026-11-02T09:00:00Z',
                    ),
            })

            const updatedReview = {
                id: 'review-123',
                analysisId:
                    'analysis-123',
                reviewStatus:
                    'needs_follow_up' as const,
                reviewedBy:
                    'user-123',
                reviewComment:
                    'More evidence is required.',
                reviewedAt:
                    new Date(
                        '2026-11-02T10:00:00Z',
                    ),
            }

            vi.mocked(
                upsertDocumentReview,
            ).mockResolvedValue(
                updatedReview,
            )

            const result =
                await saveDocumentReview(
                    'analysis-123',
                    'SUP-123',
                    'org-123',
                    'user-123',
                    {
                        reviewStatus: 'accepted',
                        reviewComment:
                            'Analysis reviewed and accepted.',
                    },
                )

            expect(result).toEqual(
                updatedReview,
            )

            expect(result.id).toBe(
                'review-123',
            )

            expect(
                insertAuditLog,
            ).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    organizationId:
                        'org-123',
                    actorUserId:
                        'user-123',
                    action:
                        'document_analysis.review_updated',
                    entityType:
                        'document_analysis',
                    entityId:
                        'analysis-123',
                    metadata:
                        expect.objectContaining({
                            reviewId:
                                'review-123',
                            previousStatus:
                                'rejected',
                            newStatus:
                                'needs_follow_up',
                            previousComment:
                                'Evidence was insufficient.',
                            newComment:
                                'More evidence is required.',
                        }),
                }),
            )
        })
    })

})


