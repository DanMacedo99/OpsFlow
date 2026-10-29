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

    reviewId: string | null
    reviewStatus:
    | 'accepted'
    | 'rejected'
    | 'needs_follow_up'
    | null
    reviewedBy: string | null
    reviewComment: string | null
    reviewedAt: Date | null
}

export type DocumentReviewRow = {
    id: string
    analysisId: string
    reviewStatus:
    | 'accepted'
    | 'rejected'
    | 'needs_follow_up'
    reviewedBy: string
    reviewComment: string | null
    reviewedAt: Date
}

export type SaveDocumentReviewInput = {
    organizationId: string
    supplierId: string
    analysisId: string
    reviewStatus:
    | 'accepted'
    | 'rejected'
    | 'needs_follow_up'
    reviewedBy: string
    reviewComment: string | null
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
            a.id,
            a.provider,
            a.model,
            a.analysis,
            a.created_at AS "createdAt",

            r.id AS "reviewId",
            r.review_status AS "reviewStatus",
            r.reviewed_by AS "reviewedBy",
            r.review_comment AS "reviewComment",
            r.reviewed_at AS "reviewedAt"

        FROM supplier_document_analyses a

        LEFT JOIN supplier_document_analysis_reviews r
            ON r.analysis_id = a.id
            AND r.organization_id = a.organization_id
            AND r.supplier_id = a.supplier_id

        WHERE a.document_id = $1
          AND a.supplier_id = $2
          AND a.organization_id = $3

        ORDER BY a.created_at DESC
        `,
            [
                documentId,
                supplierId,
                organizationId,
            ],
        )

    return result.rows
}

export async function upsertDocumentReview(
    client: PoolClient,
    input: SaveDocumentReviewInput,
): Promise<DocumentReviewRow> {
    const result =
        await client.query<DocumentReviewRow>(
            `
            INSERT INTO supplier_document_analysis_reviews (
                organization_id,
                supplier_id,
                analysis_id,
                review_status,
                reviewed_by,
                review_comment
            )
            VALUES ($1, $2, $3, $4, $5, $6)

            ON CONFLICT (analysis_id)
            DO UPDATE SET
                review_status = EXCLUDED.review_status,
                reviewed_by = EXCLUDED.reviewed_by,
                review_comment = EXCLUDED.review_comment,
                reviewed_at = CURRENT_TIMESTAMP

            RETURNING
                id,
                analysis_id AS "analysisId",
                review_status AS "reviewStatus",
                reviewed_by AS "reviewedBy",
                review_comment AS "reviewComment",
                reviewed_at AS "reviewedAt"
            `,
            [
                input.organizationId,
                input.supplierId,
                input.analysisId,
                input.reviewStatus,
                input.reviewedBy,
                input.reviewComment,
            ],
        )

    return result.rows[0]
}

export async function findDocumentReview(
    client: PoolClient,
    analysisId: string,
    supplierId: string,
    organizationId: string,
): Promise<DocumentReviewRow | null> {
    const result =
        await client.query<DocumentReviewRow>(
            `
            SELECT
                id,
                analysis_id AS "analysisId",
                review_status AS "reviewStatus",
                reviewed_by AS "reviewedBy",
                review_comment AS "reviewComment",
                reviewed_at AS "reviewedAt"
            FROM supplier_document_analysis_reviews
            WHERE analysis_id = $1
              AND supplier_id = $2
              AND organization_id = $3
            LIMIT 1
            `,
            [
                analysisId,
                supplierId,
                organizationId,
            ],
        )

    return result.rows[0] ?? null
}

export async function findDocumentAnalysisById(
    client: PoolClient,
    analysisId: string,
    supplierId: string,
    organizationId: string,
): Promise<{ id: string } | null> {
    const result =
        await client.query<{ id: string }>(
            `
            SELECT id
            FROM supplier_document_analyses
            WHERE id = $1
              AND supplier_id = $2
              AND organization_id = $3
            LIMIT 1
            `,
            [
                analysisId,
                supplierId,
                organizationId,
            ],
        )

    return result.rows[0] ?? null
}