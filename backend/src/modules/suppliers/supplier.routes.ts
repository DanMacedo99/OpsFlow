import { Router } from 'express'
import { riskAssessmentRouter } from '../risk-assessments/riskAssessment.routes.js'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createSupplier,
    getSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
} from './supplier.controller.js'
import {
    requireRole,
} from '../../middlewares/requireRole.js'
import {
    createSupplierSchema,
    updateSupplierSchema,
} from './supplier.schema.js'

export const supplierRouter = Router()

supplierRouter.get(
    '/',
    requireRole(
        'admin',
        'risk_manager',
        'reviewer',
        'viewer',
    ),
    getSuppliers,
)

supplierRouter.post(
    '/',
    requireRole(
        'admin',
        'risk_manager',
    ),
    validateBody(createSupplierSchema),
    createSupplier,
)

supplierRouter.use(
    '/:supplierId/assessments',
    riskAssessmentRouter,
)

supplierRouter.get(
    '/:id',
    requireRole(
        'admin',
        'risk_manager',
        'reviewer',
        'viewer',
    ),
    getSupplier,
)

supplierRouter.put(
    '/:id',
    requireRole(
        'admin',
        'risk_manager',
    ),
    validateBody(updateSupplierSchema),
    updateSupplier,
)

supplierRouter.delete(
    '/:id',
    requireRole('admin'),
    deleteSupplier
)