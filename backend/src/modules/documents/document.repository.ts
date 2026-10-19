import type { PoolClient } from 'pg'

export type CreateDocumentInput = {
    organizationId: string
    supplierId: string
    originalName: string
    storageKey: string
    mimeType: string
    sizeBytes: number
}

export async function insertDocument(
    client: PoolClient,
    input: CreateDocumentInput,
): Promise<string> {
    const result = await client.query<{ id: string }>(
        `
        INSERT INTO supplier_documents (
            organization_id,
            supplier_id,
            original_name,
            storage_key,
            mime_type,
            size_bytes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [
            input.organizationId,
            input.supplierId,
            input.originalName,
            input.storageKey,
            input.mimeType,
            input.sizeBytes,
        ],
    )

    return result.rows[0].id
}