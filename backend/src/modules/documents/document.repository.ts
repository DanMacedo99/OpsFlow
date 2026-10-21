import type { PoolClient } from 'pg'

export type CreateDocumentInput = {
    organizationId: string
    supplierId: string
    originalName: string
    storageKey: string
    mimeType: string
    sizeBytes: number
}

export type StoredDocument = {
    id: string
    organizationId: string
    supplierId: string
    originalName: string
    storageKey: string
    mimeType: string
    sizeBytes: number
    createdAt: Date
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

export async function findDocumentById(
    client: PoolClient,
    documentId: string,
    supplierId: string,
    organizationId: string,
): Promise<StoredDocument | null> {
    const result =
        await client.query<StoredDocument>(
            `
            SELECT
                id,
                organization_id AS "organizationId",
                supplier_id AS "supplierId",
                original_name AS "originalName",
                storage_key AS "storageKey",
                mime_type AS "mimeType",
                size_bytes AS "sizeBytes",
                created_at AS "createdAt"
            FROM supplier_documents
            WHERE id = $1
              AND supplier_id = $2
              AND organization_id = $3
            LIMIT 1
            `,
            [
                documentId,
                supplierId,
                organizationId,
            ],
        )

    return result.rows[0] ?? null
}