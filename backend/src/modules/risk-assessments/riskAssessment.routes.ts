import { Router } from 'express'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createSupplierRiskAssessment,
    finalizeSupplierRiskAssessment,
    getSupplierRiskAssessments,
    changeSupplierRiskAssessmentDocumentStatus,
} from './riskAssessment.controller.js'
import {
    createRiskAssessmentSchema,
    updateRiskAssessmentDecisionSchema,
    updateRiskAssessmentDocumentStatusSchema,
} from './riskAssessment.schema.js'


export const riskAssessmentRouter = Router({
    mergeParams: true,
})

riskAssessmentRouter.get(
    '/',
    getSupplierRiskAssessments,
)
riskAssessmentRouter.post(
    '/',
    validateBody(createRiskAssessmentSchema),
    createSupplierRiskAssessment,
)

riskAssessmentRouter.patch(
    '/:assessmentId/decision',
    validateBody(updateRiskAssessmentDecisionSchema),
    finalizeSupplierRiskAssessment,
)

riskAssessmentRouter.patch(
    '/:assessmentId/document-status',
    validateBody(updateRiskAssessmentDocumentStatusSchema),
    changeSupplierRiskAssessmentDocumentStatus,
)