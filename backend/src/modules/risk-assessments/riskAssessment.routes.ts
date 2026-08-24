import { Router } from 'express'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createSupplierRiskAssessment,
    getSupplierRiskAssessments,
} from './riskAssessment.controller.js'
import { createRiskAssessmentSchema } from './riskAssessment.schema.js'

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