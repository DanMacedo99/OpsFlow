import { apiFetch } from './apiClient'

type UploadDocumentResponse = {
    message: string
    documentId: string
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