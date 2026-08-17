import type {
    NextFunction,
    Request,
    Response,
} from 'express'
import { listSuppliers } from './supplier.service.js'

export async function getSuppliers(
    _request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const suppliers = await listSuppliers()

        response.status(200).json({
            data: suppliers,
        })
    } catch (error) {
        next(error)
    }
}