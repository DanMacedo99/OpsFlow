import { AppError } from '../../errors/AppError.js'

import type {
    NextFunction,
    Request,
    Response,
} from 'express'

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

        const organizationId = getOrganizationId(request)
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

        const organizationId = getOrganizationId(request)

        const assessment =
            await createRiskAssessmentForSupplier(
                request.params.supplierId,
                request.body,
                organizationId
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

        const organizationId = getOrganizationId(request)

        const result = await finalizeRiskAssessment(
            request.params.supplierId,
            request.params.assessmentId,
            request.body,
            organizationId
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

        const organizationId = getOrganizationId(request)
        const assessment =
            await changeRiskAssessmentDocumentStatus(
                request.params.supplierId,
                request.params.assessmentId,
                request.body,
                organizationId

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

        const organizationId = getOrganizationId(request)
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

function getOrganizationId(
    request: Request,
): string {
    const organizationId =
        request.session.user?.organizationId

    if (!organizationId) {
        throw new AppError(
            401,
            'AUTHENTICATION_REQUIRED',
            'Authentication is required.',
        )
    }

    return organizationId
}