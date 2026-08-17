import { Router } from 'express'
import { getSuppliers } from './supplier.controller.js'

export const supplierRouter = Router()

supplierRouter.get('/', getSuppliers)