import { runInTransaction } from '../../config/database.js'
import {
    readDocument,
    saveDocument,
    deleteDocument,
} from './document.storage.js'

import { insertAuditLog } from '../audit-logs/auditLog.repository.js'

import {
    getSupplierById,
} from '../suppliers/supplier.service.js'

import {
    qualifyDocumentContext,
} from './document.qualification.service.js'

import type {
    DocumentQualification,
} from './document.qualification.schema.js'

import { aiConfig } from '../../ai/ai.config.js'

import {
    buildDocumentContext,
    prepareDocumentText
} from './document.processing.js'

import {
    calculateDocumentHash,
} from './document.hash.js'

import {
    extractPdfText,
} from './document.parser.js'


import {
    analyzeDocumentContext,
} from './document.ai.service.js'

import type {
    DocumentReviewInput,
} from './document.review.schema.js'

import {
    insertDocumentAnalysis,
    findDocumentAnalysisById,
    upsertDocumentReview,
    findDocumentReview,
    findDocumentByHash,
    findDocumentAnalyses,
    insertDocument,
    findDocumentById,
    findDocumentsBySupplier,
    type DocumentListItem,
    type DocumentReviewRow,
} from './document.repository.js'

import {
    documentAnalysisSchema,
    type DocumentAnalysis,
} from './document.analysis.schema.js'

import { AppError } from '../../errors/AppError.js'

type UploadDocumentInput = {
    organizationId: string
    supplierId: string
    actorUserId: string
    originalName: string
    mimeType: string
    sizeBytes: number
    buffer: Buffer
}

type AnalyzeStoredDocumentResult =
    | {
        status: 'rejected'
        qualification: DocumentQualification
    }
    | {
        status: 'completed'
        qualification: DocumentQualification
        analysisId: string
        analysis: DocumentAnalysis
    }

export type StoredDocumentAnalysis = {
    id: string
    provider: string
    model: string
    createdAt: Date
    analysis: DocumentAnalysis
    review: StoredDocumentReview | null
}

export type StoredDocumentReview = {
    id: string
    reviewStatus:
    | 'accepted'
    | 'rejected'
    | 'needs_follow_up'
    reviewedBy: string
    reviewComment: string | null
    reviewedAt: Date
}



export async function createDocument(
    input: UploadDocumentInput,
): Promise<string> {



    try {
        const pages = await extractPdfText(input.buffer)

        const hasText = pages.some(
            (page) => Boolean(prepareDocumentText(page.text)),
        )

        if (!hasText) {
            throw new AppError(
                400,
                'PDF_TEXT_NOT_FOUND',
                'The PDF does not contain extractable text.',
            )
        }

    } catch (error) {
        if (error instanceof AppError) {
            throw error
        }

        throw new AppError(
            400,
            'INVALID_PDF',
            'The PDF could not be processed.',
        )
    }

    const contentHash =
        calculateDocumentHash(input.buffer)


    const existingDocumentId =
        await runInTransaction(
            async (client) =>
                findDocumentByHash(
                    client,
                    input.organizationId,
                    input.supplierId,
                    contentHash,
                ),
        )

    if (existingDocumentId) {
        throw new AppError(
            409,
            'DUPLICATE_DOCUMENT',
            'This document has already been uploaded for this supplier.',
        )
    }

    const storageKey = await saveDocument(input.buffer)

    try {
        const documentId = await runInTransaction(
            async (client) => {
                const insertedDocumentId =
                    await insertDocument(client, {
                        organizationId: input.organizationId,
                        supplierId: input.supplierId,
                        originalName: input.originalName,
                        storageKey,
                        mimeType: input.mimeType,
                        sizeBytes: input.sizeBytes,
                        contentHash,
                    })

                await insertAuditLog(client, {
                    organizationId:
                        input.organizationId,
                    actorUserId:
                        input.actorUserId,
                    action: 'document.uploaded',
                    entityType: 'document',
                    entityId: insertedDocumentId,
                    metadata: {
                        supplierId:
                            input.supplierId,
                        originalName:
                            input.originalName,
                        mimeType:
                            input.mimeType,
                        sizeBytes:
                            input.sizeBytes,
                    },
                })

                return insertedDocumentId
            },
        )

        return documentId

    } catch (error) {
        try {
            await deleteDocument(storageKey)
        } catch (cleanupError) {
            console.error(
                'Could not remove orphaned document:',
                cleanupError,
            )
        }

        throw error
    }

}

export async function listSupplierDocuments(
    supplierId: string,
    organizationId: string,
): Promise<DocumentListItem[]> {
    return runInTransaction(
        async (client) =>
            findDocumentsBySupplier(
                client,
                supplierId,
                organizationId,
            ),
    )
}

export async function listDocumentAnalyses(
    documentId: string,
    supplierId: string,
    organizationId: string,
): Promise<StoredDocumentAnalysis[]> {
    const rows =
        await runInTransaction(
            async (client) =>
                findDocumentAnalyses(
                    client,
                    documentId,
                    supplierId,
                    organizationId,
                ),
        )

    return rows.map((row) => {
        const parsed =
            documentAnalysisSchema.safeParse(
                row.analysis,
            )

        if (!parsed.success) {
            throw new AppError(
                500,
                'INVALID_STORED_ANALYSIS',
                'A stored document analysis is invalid.',
            )
        }

        const review =
            row.reviewId === null
                ? null
                : {
                    id: row.reviewId,
                    reviewStatus:
                        row.reviewStatus!,
                    reviewedBy:
                        row.reviewedBy!,
                    reviewComment:
                        row.reviewComment,
                    reviewedAt:
                        row.reviewedAt!,
                }

        return {
            id: row.id,
            provider: row.provider,
            model: row.model,
            createdAt: row.createdAt,
            analysis: parsed.data,
            review,
        }
    })
}

export async function analyzeStoredDocument(
    documentId: string,
    supplierId: string,
    organizationId: string,
    actorUserId: string,
): Promise<AnalyzeStoredDocumentResult> {
    const document =
        await runInTransaction(
            async (client) =>
                findDocumentById(
                    client,
                    documentId,
                    supplierId,
                    organizationId,
                ),
        )

    if (!document) {
        throw new AppError(
            404,
            'DOCUMENT_NOT_FOUND',
            'Document not found.',
        )
    }

    const buffer =
        await readDocument(
            document.storageKey,
        )

    const pages =
        await extractPdfText(buffer)

    const documentContext =
        buildDocumentContext(pages)

    if (!documentContext) {
        throw new AppError(
            400,
            'PDF_TEXT_NOT_FOUND',
            'The PDF does not contain extractable text.',
        )
    }

    const supplier =
        await getSupplierById(
            supplierId,
            organizationId,
        )

    if (!supplier) {
        throw new AppError(
            404,
            'SUPPLIER_NOT_FOUND',
            'Supplier not found.',
        )
    }

    const qualification =
        await qualifyDocumentContext(
            documentContext,
            supplier.name,
        )

    const canAnalyze =
        qualification.supplierMatch === 'match' &&
        qualification.relevance === 'relevant'

    if (!canAnalyze) {
        return {
            status: 'rejected',
            qualification,
        }
    }



    const analysis =
        await analyzeDocumentContext(
            documentContext,
        )

    const analysisId = await runInTransaction(
        async (client) => {
            const insertedAnalysisId =
                await insertDocumentAnalysis(
                    client,
                    {
                        organizationId,
                        supplierId,
                        documentId,
                        provider:
                            aiConfig.provider,
                        model:
                            aiConfig.model,
                        analysis,
                    },
                )

            await insertAuditLog(client, {
                organizationId,
                actorUserId,
                action:
                    'document_analysis.completed',
                entityType:
                    'document_analysis',
                entityId:
                    insertedAnalysisId,
                metadata: {
                    supplierId,
                    documentId,
                    provider:
                        aiConfig.provider,
                    model:
                        aiConfig.model,
                    overallStatus:
                        analysis.overallStatus,
                    riskCount:
                        analysis.risks.length,
                    inconsistencyCount:
                        analysis.inconsistencies
                            .length,
                    missingEvidenceCount:
                        analysis.missingEvidence
                            .length,
                },
            })

            return insertedAnalysisId
        },
    )

    return {
        status: 'completed',
        qualification,
        analysisId,
        analysis,
    }
}

export async function saveDocumentReview(
    analysisId: string,
    supplierId: string,
    organizationId: string,
    reviewedBy: string,
    input: DocumentReviewInput,
): Promise<DocumentReviewRow> {
    return runInTransaction(
        async (client) => {
            const analysis =
                await findDocumentAnalysisById(
                    client,
                    analysisId,
                    supplierId,
                    organizationId,
                )

            if (!analysis) {
                throw new AppError(
                    404,
                    'DOCUMENT_ANALYSIS_NOT_FOUND',
                    'Document analysis not found.',
                )
            }

            const existingReview =
                await findDocumentReview(
                    client,
                    analysisId,
                    supplierId,
                    organizationId,
                )

            const review =
                await upsertDocumentReview(
                    client,
                    {
                        organizationId,
                        supplierId,
                        analysisId,
                        reviewStatus:
                            input.reviewStatus,
                        reviewedBy,
                        reviewComment:
                            input.reviewComment ??
                            null,
                    },
                )


            await insertAuditLog(client, {
                organizationId,
                actorUserId: reviewedBy,

                action: existingReview
                    ? 'document_analysis.review_updated'
                    : 'document_analysis.reviewed',

                entityType:
                    'document_analysis',

                entityId: analysisId,

                metadata: {
                    supplierId,
                    reviewId: review.id,

                    previousStatus:
                        existingReview?.reviewStatus ??
                        null,

                    newStatus:
                        review.reviewStatus,

                    previousComment:
                        existingReview?.reviewComment ??
                        null,

                    newComment:
                        review.reviewComment,
                },
            })

            return review
        },
    )
}