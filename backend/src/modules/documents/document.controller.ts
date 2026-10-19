import type {
    Request,
    Response,
} from 'express'
import { createDocument } from './document.service.js'
import { getSupplierById } from '../suppliers/supplier.service.js'
import { getAuthenticatedOrganizationId } from '../auth/authSession.js'

export async function uploadSupplierDocument(
    request: Request,
    response: Response,
): Promise<void> {
    const file = request.file

    if (!file) {
        response.status(400).json({
            message: 'A PDF file is required.',
        })
        return
    }

    const pdfSignature = Buffer.from('%PDF-')

    const isPdf = file.buffer
        .subarray(0, pdfSignature.length)
        .equals(pdfSignature)

    if (!isPdf) {
        response.status(400).json({
            message: 'Invalid PDF file.',
        })
        return
    }

    const organizationId =
        getAuthenticatedOrganizationId(request)

    const supplierId = request.params.supplierId

    if (typeof supplierId !== 'string') {
        response.status(400).json({
            message: 'Invalid supplier ID.',
        })
        return
    }
    const supplier = await getSupplierById(
        supplierId,
        organizationId,
    )

    if (!supplier) {
        response.status(404).json({
            message: 'Supplier not found.',
        })
        return
    }

    const documentId = await createDocument({
        organizationId,
        supplierId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        buffer: file.buffer,
    })

    response.status(201).json({
        message: 'Document uploaded successfully.',
        documentId,
    })
}