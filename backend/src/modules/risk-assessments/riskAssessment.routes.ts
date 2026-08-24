import { Router } from 'express'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createSupplierRiskAssessment,
    finalizeSupplierRiskAssessment,
    getSupplierRiskAssessments,
} from './riskAssessment.controller.js'
import {
    createRiskAssessmentSchema,
    updateRiskAssessmentDecisionSchema,
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