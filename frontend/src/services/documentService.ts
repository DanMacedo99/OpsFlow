import { apiFetch } from './apiClient'

type UploadDocumentResponse = {
    message: string
    documentId: string
}

export type DocumentReviewInput = {
    reviewStatus:
        | 'accepted'
        | 'rejected'
        | 'needs_follow_up'
    reviewComment?: string | null
}

export type DocumentQualification = {
    detectedSupplier: string | null
    supplierMatch:
        | 'match'
        | 'mismatch'
        | 'uncertain'
    relevance:
        | 'relevant'
        | 'irrelevant'
        | 'uncertain'
    documentType: string
    reason: string
}

export type SupplierDocument = {
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
    createdAt: string
}

type SupplierDocumentsResponse = {
    documents: SupplierDocument[]
}

export type DocumentAnalysis = {
    supplier: string
    overallStatus: string
    summary: string

    risks: {
        title: string
        severity:
            | 'low'
            | 'medium'
            | 'high'
            | 'critical'
            | 'unknown'
        description: string
        pages: number[]
    }[]

    inconsistencies: {
        description: string
        pages: number[]
    }[]

    missingEvidence: {
        description: string
        pages: number[]
    }[]
}

type AnalyzeDocumentResponse =
    | {
          status: 'completed'
          qualification: DocumentQualification
          analysisId: string
          analysis: DocumentAnalysis
      }
    | {
          status: 'rejected'
          qualification: DocumentQualification
      }

export type StoredDocumentAnalysis = {
    id: string
    provider: string
    model: string
    createdAt: string
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
    reviewedAt: string
}

type DocumentAnalysesResponse = {
    analyses: StoredDocumentAnalysis[]
}

export async function getSupplierDocuments(
    supplierId: string,
): Promise<SupplierDocument[]> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/documents`,
    )

    if (!response.ok) {
        throw new Error(
            `Could not load documents. Status: ${response.status}`,
        )
    }

    const data =
        (await response.json()) as SupplierDocumentsResponse

    return data.documents
}

export async function uploadSupplierDocument(
    supplierId: string,
    file: File,
): Promise<UploadDocumentResponse> {
    const formData = new FormData()

    formData.append('document', file)

    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(supplierId)}/documents`,
        {
            method: 'POST',
            body: formData,
        },
    )

    if (!response.ok) {
        throw new Error(
            `Could not upload document. Status: ${response.status}`,
        )
    }

    return (await response.json()) as UploadDocumentResponse
}

export async function analyzeSupplierDocument(
    supplierId: string,
    documentId: string,
): Promise<AnalyzeDocumentResponse> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/documents/${encodeURIComponent(
            documentId,
        )}/analyze`,
        {
            method: 'POST',
        },
    )

    if (
        !response.ok &&
        response.status !== 422
    ) {
        throw new Error(
            `Could not analyze document. Status: ${response.status}`,
        )
    }

    return (await response.json()) as AnalyzeDocumentResponse
}

export async function getDocumentAnalyses(
    supplierId: string,
    documentId: string,
): Promise<StoredDocumentAnalysis[]> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/documents/${encodeURIComponent(
            documentId,
        )}/analyses`,
    )

    if (!response.ok) {
        throw new Error(
            `Could not load document analyses. Status: ${response.status}`,
        )
    }

    const data =
        (await response.json()) as DocumentAnalysesResponse

    return data.analyses
}

export async function reviewDocumentAnalysis(
    supplierId: string,
    analysisId: string,
    input: DocumentReviewInput,
): Promise<StoredDocumentReview> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/documents/analyses/${encodeURIComponent(
            analysisId,
        )}/review`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw new Error(
            `Could not review document analysis. Status: ${response.status}`,
        )
    }

    const data = (await response.json()) as {
        review: StoredDocumentReview
    }

    return data.review
}