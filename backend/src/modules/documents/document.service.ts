import { runInTransaction } from '../../config/database.js'
import {
    readDocument,
    saveDocument,
    deleteDocument,
} from './document.storage.js'

import { aiConfig } from '../../ai/ai.config.js'

import {
    buildDocumentContext,
    prepareDocumentText
} from './document.processing.js'

import {
    extractPdfText,
} from './document.parser.js'


import {
    analyzeDocumentContext,
} from './document.ai.service.js'

import {
    insertDocumentAnalysis,
    findDocumentAnalyses,
    insertDocument,
    findDocumentById,
    findDocumentsBySupplier,
    type DocumentListItem,
} from './document.repository.js'

import {
    documentAnalysisSchema,
    type DocumentAnalysis,
} from './document.analysis.schema.js'

import { AppError } from '../../errors/AppError.js'

type UploadDocumentInput = {
    organizationId: string
    supplierId: string
    originalName: string
    mimeType: string
    sizeBytes: number
    buffer: Buffer
}

type AnalyzeStoredDocumentResult = {
    analysisId: string
    analysis: DocumentAnalysis
}

export type StoredDocumentAnalysis = {
    id: string
    provider: string
    model: string
    createdAt: Date
    analysis: DocumentAnalysis
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

    const storageKey = await saveDocument(input.buffer)

    try {
        const documentId = await runInTransaction(
            async (client) => {
                return insertDocument(client, {
                    organizationId: input.organizationId,
                    supplierId: input.supplierId,
                    originalName: input.originalName,
                    storageKey,
                    mimeType: input.mimeType,
                    sizeBytes: input.sizeBytes,
                })
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

        return {
            id: row.id,
            provider: row.provider,
            model: row.model,
            createdAt: row.createdAt,
            analysis: parsed.data,
        }
    })
}

export async function analyzeStoredDocument(
    documentId: string,
    supplierId: string,
    organizationId: string,
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

    const analysis =
        await analyzeDocumentContext(
            documentContext,
        )

    const analysisId =
        await runInTransaction(
            async (client) =>
                insertDocumentAnalysis(
                    client,
                    {
                        organizationId,
                        supplierId,
                        documentId,
                        provider: aiConfig.provider,
                        model: aiConfig.model,
                        analysis,
                    },
                ),
        )

    return {
        analysisId,
        analysis,
    }
}