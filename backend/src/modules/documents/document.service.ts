import { runInTransaction } from '../../config/database.js'
import { insertDocument } from './document.repository.js'
import {
    saveDocument,
    deleteDocument,
} from './document.storage.js'

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