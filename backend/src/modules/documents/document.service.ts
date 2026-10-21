import { runInTransaction } from '../../config/database.js'
import { insertDocument } from './document.repository.js'
import {
    saveDocument,
    deleteDocument,
} from './document.storage.js'

import { prepareDocumentText } from './document.processing.js'

import {
    findDocumentById,
} from './document.repository.js'

import {
    readDocument,
} from './document.storage.js'

import {
    extractPdfText,
} from './document.parser.js'

import {
    buildDocumentContext,
} from './document.processing.js'

import {
    analyzeDocumentContext,
} from './document.ai.service.js'

import type {
    DocumentAnalysis,
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

export async function analyzeStoredDocument(
    documentId: string,
    supplierId: string,
    organizationId: string,
): Promise<DocumentAnalysis> {
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

    return analyzeDocumentContext(
        documentContext,
    )
}