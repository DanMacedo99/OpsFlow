import { apiFetch } from './apiClient'

type UploadDocumentResponse = {
    message: string
    documentId: string
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

type AnalyzeDocumentResponse = {
    analysis: DocumentAnalysis
}

export type StoredDocumentAnalysis = {
    id: string
    provider: string
    model: string
    createdAt: string
    analysis: DocumentAnalysis
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
): Promise<DocumentAnalysis> {
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

    if (!response.ok) {
        throw new Error(
            `Could not analyze document. Status: ${response.status}`,
        )
    }

    const data =
        (await response.json()) as AnalyzeDocumentResponse

    return data.analysis
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