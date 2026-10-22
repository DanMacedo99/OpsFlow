import type {
    Request,
    Response,
} from 'express'

import {
    createDocument,
    analyzeStoredDocument,
    listSupplierDocuments,
    listDocumentAnalyses,
} from './document.service.js'

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

export async function getSupplierDocuments(
    request: Request,
    response: Response,
): Promise<void> {
    const supplierId =
        request.params.supplierId

    if (typeof supplierId !== 'string') {
        response.status(400).json({
            message: 'Invalid supplier ID.',
        })
        return
    }

    const organizationId =
        getAuthenticatedOrganizationId(
            request,
        )

    const documents =
        await listSupplierDocuments(
            supplierId,
            organizationId,
        )

    response.status(200).json({
        documents,
    })
}

export async function analyzeSupplierDocument(
    request: Request,
    response: Response,
): Promise<void> {
    const supplierId =
        request.params.supplierId

    const documentId =
        request.params.documentId

    if (
        typeof supplierId !== 'string' ||
        typeof documentId !== 'string'
    ) {
        response.status(400).json({
            message: 'Invalid supplier or document ID.',
        })
        return
    }

    const organizationId =
        getAuthenticatedOrganizationId(
            request,
        )

   const result =
    await analyzeStoredDocument(
        documentId,
        supplierId,
        organizationId,
    )

response.status(200).json(result)
}

export async function getDocumentAnalyses(
    request: Request,
    response: Response,
): Promise<void> {
    const supplierId =
        request.params.supplierId

    const documentId =
        request.params.documentId

    if (
        typeof supplierId !== 'string' ||
        typeof documentId !== 'string'
    ) {
        response.status(400).json({
            message:
                'Invalid supplier or document ID.',
        })
        return
    }

    const organizationId =
        getAuthenticatedOrganizationId(
            request,
        )

    const analyses =
        await listDocumentAnalyses(
            documentId,
            supplierId,
            organizationId,
        )

    response.status(200).json({
        analyses,
    })
}