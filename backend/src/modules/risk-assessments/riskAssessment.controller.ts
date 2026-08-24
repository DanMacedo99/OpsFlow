import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    createRiskAssessmentForSupplier,
    listRiskAssessmentsBySupplierId,
} from './riskAssessment.service.js'

import type { CreateRiskAssessmentInput } from './riskAssessment.schema.js'

type SupplierParams = {
    supplierId: string
}

export async function getSupplierRiskAssessments(
    request: Request<SupplierParams>,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const assessments =
            await listRiskAssessmentsBySupplierId(
                request.params.supplierId,
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
        const assessment =
            await createRiskAssessmentForSupplier(
                request.params.supplierId,
                request.body,
            )

        response.status(201).json({
            data: assessment,
        })
    } catch (error) {
        next(error)
    }
}