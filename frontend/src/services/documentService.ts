import { apiFetch } from './apiClient'

type UploadDocumentResponse = {
    message: string
    documentId: string
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