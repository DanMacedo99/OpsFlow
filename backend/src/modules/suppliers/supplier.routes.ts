import { Router } from 'express'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createSupplier,
    getSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
} from './supplier.controller.js'

import {
    createSupplierSchema,
    updateSupplierSchema,
} from './supplier.schema.js'

export const supplierRouter = Router()

supplierRouter.get('/', getSuppliers)

supplierRouter.post(
    '/',
    validateBody(createSupplierSchema),
    createSupplier,
)

supplierRouter.get('/:id', getSupplier)

supplierRouter.put(
    '/:id',
    validateBody(updateSupplierSchema),
    updateSupplier,
)

supplierRouter.delete(
    '/:id',
    deleteSupplier
)