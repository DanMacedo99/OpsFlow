
import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    getSupplierById,
} from '../suppliers/supplier.service.js'

import {
    getAuthenticatedOrganizationId,
    getAuthenticatedUser,
} from '../auth/authSession.js'

import {
    createRiskAssessmentForSupplier,
    listRiskAssessmentsBySupplierId,
    finalizeRiskAssessment,
    changeRiskAssessmentDocumentStatus,
    listRiskHistoryBySupplierId,
} from './riskAssessment.service.js'

import type {
    CreateRiskAssessmentInput,
    UpdateRiskAssessmentDecisionInput,
    UpdateRiskAssessmentDocumentStatusInput,
} from './riskAssessment.schema.js'

import {
    getSocketServer,
} from '../../realtime/socket.js'

type SupplierParams = {
    supplierId: string
}
type AssessmentParams = {
    supplierId: string
    assessmentId: string
}

export async function getSupplierRiskAssessments(
    request: Request<SupplierParams>,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {

        const organizationId = getAuthenticatedOrganizationId(request)
        const assessments =
            await listRiskAssessmentsBySupplierId(
                request.params.supplierId,
                organizationId
            )

        response.status(200).json({
            data: assessments,
        })
    } catch (error) {
        next(error)
    }
}

export async function createSupplierRiskAssessment(
    request: Request<
        SupplierParams,
        unknown,
        CreateRiskAssessmentInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {

        const authenticatedUser = getAuthenticatedUser(request)

        const assessment =
            await createRiskAssessmentForSupplier(
                request.params.supplierId,
                request.body,
                authenticatedUser.organizationId,
                authenticatedUser.id
            )

        if (!assessment) {
            response.status(404).json({
                error: {
                    code: 'SUPPLIER_NOT_FOUND',
                    message: 'Supplier not found.',
                },
            })
            return
        }

        const io = getSocketServer()

        io.to(
            authenticatedUser.organizationId,
        ).emit(
            'assessment:created',
            assessment,
        )

        const supplier = await getSupplierById(
            assessment.supplierId,
            authenticatedUser.organizationId,
        )

        if (supplier) {
            io.to(
                authenticatedUser.organizationId,
            ).emit(
                'supplier:updated',
                supplier,
            )
        }

        response.status(201).json({
            data: assessment,
        })
    } catch (error) {
        next(error)
    }
}

export async function finalizeSupplierRiskAssessment(
    request: Request<
        AssessmentParams,
        unknown,
        UpdateRiskAssessmentDecisionInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {

        const authenticatedUser = getAuthenticatedUser(request)

        const result = await finalizeRiskAssessment(
            request.params.supplierId,
            request.params.assessmentId,
            request.body,
            authenticatedUser.organizationId,
            authenticatedUser.id
        )

        if (result.outcome === 'not-found') {
            response.status(404).json({
                error: {
                    code: 'RISK_ASSESSMENT_NOT_FOUND',
                    message: 'Risk assessment not found.',
                },
            })
            return
        }

        if (result.outcome === 'already-finalized') {
            response.status(409).json({
                error: {
                    code: 'RISK_ASSESSMENT_ALREADY_FINALIZED',
                    message:
                        'Risk assessment has already been finalized.',
                },
            })
            return
        }

        if (
            result.outcome ===
            'documents-not-verified'
        ) {
            response.status(409).json({
                error: {
                    code: 'DOCUMENTS_NOT_VERIFIED',
                    message:
                        'Documents must be verified before approval.',
                },
            })
            return
        }

        const io = getSocketServer()

        io.to(
            authenticatedUser.organizationId,
        ).emit(
            'assessment:updated',
            result.assessment,
        )

        const supplier = await getSupplierById(
            result.assessment.supplierId,
            authenticatedUser.organizationId,
        )

        if (supplier) {
            io.to(
                authenticatedUser.organizationId,
            ).emit(
                'supplier:updated',
                supplier,
            )
        }

        response.status(200).json({
            data: result.assessment,
        })
    } catch (error) {
        next(error)
    }
}

export async function changeSupplierRiskAssessmentDocumentStatus(
    request: Request<
        AssessmentParams,
        unknown,
        UpdateRiskAssessmentDocumentStatusInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {

        const authenticatedUser = getAuthenticatedUser(request)
        const assessment =
            await changeRiskAssessmentDocumentStatus(
                request.params.supplierId,
                request.params.assessmentId,
                request.body,
                authenticatedUser.organizationId,
                authenticatedUser.id
            )

        if (!assessment) {
            response.status(404).json({
                error: {
                    code: 'RISK_ASSESSMENT_NOT_FOUND',
                    message: 'Risk assessment not found.',
                },
            })
            return
        }

        const io = getSocketServer()

        io.to(
            authenticatedUser.organizationId,
        ).emit(
            'assessment:updated',
            assessment,
        )

        const supplier = await getSupplierById(
            assessment.supplierId,
            authenticatedUser.organizationId,
        )

        if (supplier) {
            io.to(
                authenticatedUser.organizationId,
            ).emit(
                'supplier:updated',
                supplier,
            )
        }

        response.status(200).json({
            data: assessment,
        })
    } catch (error) {
        next(error)
    }
}

export async function getSupplierRiskHistory(
    request: Request<SupplierParams>,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {

        const organizationId = getAuthenticatedOrganizationId(request)
        const history =
            await listRiskHistoryBySupplierId(
                request.params.supplierId,
                organizationId
            )



        response.status(200).json({
            data: history,
        })
    } catch (error) {
        next(error)
    }
}

