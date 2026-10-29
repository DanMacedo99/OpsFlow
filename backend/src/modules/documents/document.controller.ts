import type {
    Request,
    Response,
} from 'express'

import {
    createDocument,
    analyzeStoredDocument,
    listSupplierDocuments,
    listDocumentAnalyses,
    saveDocumentReview,
} from './document.service.js'

import {
    documentReviewSchema,
} from './document.review.schema.js'

import { getSupplierById } from '../suppliers/supplier.service.js'

import {
    getAuthenticatedOrganizationId,
    getAuthenticatedUser
} from '../auth/authSession.js'

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

    const authenticatedUser =
        getAuthenticatedUser(request)

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
        actorUserId: authenticatedUser.id,
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

    const authenticatedUser =
        getAuthenticatedUser(request)


    const result =
        await analyzeStoredDocument(
            documentId,
            supplierId,
            organizationId,
            authenticatedUser.id
        )

    if (result.status === 'rejected') {
        response.status(422).json(result)
        return
    }

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

export async function reviewDocumentAnalysis(
    request: Request,
    response: Response,
): Promise<void> {
    const supplierId =
        request.params.supplierId

    const analysisId =
        request.params.analysisId

    if (
        typeof supplierId !== 'string' ||
        typeof analysisId !== 'string'
    ) {
        response.status(400).json({
            message:
                'Invalid supplier or analysis ID.',
        })
        return
    }

    const parsed =
        documentReviewSchema.safeParse(
            request.body,
        )

    if (!parsed.success) {
        response.status(400).json({
            error: {
                code: 'INVALID_REVIEW',
                message:
                    'Invalid document review.',
            },
        })
        return
    }

    const organizationId =
        getAuthenticatedOrganizationId(
            request,
        )

    const authenticatedUser =
        getAuthenticatedUser(request)

    const review =
        await saveDocumentReview(
            analysisId,
            supplierId,
            organizationId,
            authenticatedUser.id,
            parsed.data,
        )

    response.status(200).json({
        review,
    })
}