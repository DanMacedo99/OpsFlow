import { Router } from 'express'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createSupplierRiskAssessment,
    finalizeSupplierRiskAssessment,
    getSupplierRiskAssessments,
    changeSupplierRiskAssessmentDocumentStatus,
    getSupplierRiskHistory,
} from './riskAssessment.controller.js'
import {
    createRiskAssessmentSchema,
    updateRiskAssessmentDecisionSchema,
    updateRiskAssessmentDocumentStatusSchema,
} from './riskAssessment.schema.js'
import {
    requireRole,
} from '../../middlewares/requireRole.js'

export const riskAssessmentRouter = Router({
    mergeParams: true,
})

riskAssessmentRouter.get(
    '/',
    requireRole(
        'admin',
        'risk_manager',
        'reviewer',
        'viewer',
    ),
    getSupplierRiskAssessments,
)

riskAssessmentRouter.get(
    '/risk-history',
    requireRole(
        'admin',
        'risk_manager',
        'reviewer',
        'viewer',
    ),
    getSupplierRiskHistory,
)

riskAssessmentRouter.post(
    '/',
    requireRole(
        'admin',
        'risk_manager',
    ),
    validateBody(createRiskAssessmentSchema),
    createSupplierRiskAssessment,
)

riskAssessmentRouter.patch(
    '/:assessmentId/decision',
    requireRole(
        'admin',
        'reviewer',
    ),
    validateBody(updateRiskAssessmentDecisionSchema),
    finalizeSupplierRiskAssessment,
)

riskAssessmentRouter.patch(
    '/:assessmentId/document-status',
    requireRole(
        'admin',
        'risk_manager',
    ),
    validateBody(
        updateRiskAssessmentDocumentStatusSchema,
    ),
    changeSupplierRiskAssessmentDocumentStatus,
)