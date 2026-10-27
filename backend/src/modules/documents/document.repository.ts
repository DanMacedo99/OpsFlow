import type { PoolClient } from 'pg'
import type {
    DocumentAnalysis,
} from './document.analysis.schema.js'

export type CreateDocumentInput = {
    organizationId: string
    supplierId: string
    originalName: string
    storageKey: string
    mimeType: string
    sizeBytes: number
    contentHash: string
}

export type DocumentListItem = {
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
    createdAt: Date
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

export type CreateDocumentAnalysisInput = {
    organizationId: string
    supplierId: string
    documentId: string
    provider: string
    model: string
    analysis: DocumentAnalysis
}

export type StoredDocumentAnalysisRow = {
    id: string
    provider: string
    model: string
    analysis: unknown
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
            size_bytes,
            content_hash
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
        `,
        [
            input.organizationId,
            input.supplierId,
            input.originalName,
            input.storageKey,
            input.mimeType,
            input.sizeBytes,
            input.contentHash,
        ],
    )

    return result.rows[0].id
}

export async function insertDocumentAnalysis(
    client: PoolClient,
    input: CreateDocumentAnalysisInput,
): Promise<string> {
    const result =
        await client.query<{ id: string }>(
            `
            INSERT INTO supplier_document_analyses (
                organization_id,
                supplier_id,
                document_id,
                provider,
                model,
                analysis
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `,
            [
                input.organizationId,
                input.supplierId,
                input.documentId,
                input.provider,
                input.model,
                input.analysis,
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

export async function findDocumentByHash(
    client: PoolClient,
    organizationId: string,
    supplierId: string,
    contentHash: string,
): Promise<string | null> {
    const result =
        await client.query<{ id: string }>(
            `
            SELECT id
            FROM supplier_documents
            WHERE organization_id = $1
              AND supplier_id = $2
              AND content_hash = $3
            LIMIT 1
            `,
            [
                organizationId,
                supplierId,
                contentHash,
            ],
        )

    return result.rows[0]?.id ?? null
}

export async function findDocumentsBySupplier(
    client: PoolClient,
    supplierId: string,
    organizationId: string,
): Promise<DocumentListItem[]> {
    const result =
        await client.query<DocumentListItem>(
            `
            SELECT
                id,
                original_name AS "originalName",
                mime_type AS "mimeType",
                size_bytes AS "sizeBytes",
                created_at AS "createdAt"
            FROM supplier_documents
            WHERE supplier_id = $1
              AND organization_id = $2
            ORDER BY created_at DESC
            `,
            [
                supplierId,
                organizationId,
            ],
        )

    return result.rows
}

export async function findDocumentAnalyses(
    client: PoolClient,
    documentId: string,
    supplierId: string,
    organizationId: string,
): Promise<StoredDocumentAnalysisRow[]> {
    const result =
        await client.query<StoredDocumentAnalysisRow>(
            `
            SELECT
                id,
                provider,
                model,
                analysis,
                created_at AS "createdAt"
            FROM supplier_document_analyses
            WHERE document_id = $1
              AND supplier_id = $2
              AND organization_id = $3
            ORDER BY created_at DESC
            `,
            [
                documentId,
                supplierId,
                organizationId,
            ],
        )

    return result.rows
}