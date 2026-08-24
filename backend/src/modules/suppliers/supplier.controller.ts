import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    createSupplier as createSupplierService,
    deleteSupplier as deleteSupplierService,
    getSupplierById,
    listSuppliers,
    updateSupplier as updateSupplierService,
} from './supplier.service.js'

import type {
    CreateSupplierInput,
    UpdateSupplierInput,
} from './supplier.schema.js'

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

export async function getSupplier(
    request: Request<{ id: string }>,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const supplier = await getSupplierById(
            request.params.id,
        )

        if (!supplier) {
            response.status(404).json({
                error: {
                    code: 'SUPPLIER_NOT_FOUND',
                    message: 'Supplier not found.',
                },
            })

            return
        }

        response.status(200).json({
            data: supplier,
        })
    } catch (error) {
        next(error)
    }
}

export async function createSupplier(
    request: Request<
        Record<string, never>,
        unknown,
        CreateSupplierInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const supplier = await createSupplierService(
            request.body,
        )

        response.status(201).json({
            data: supplier,
        })
    } catch (error) {
        next(error)
    }
}

export async function updateSupplier(
    request: Request<
        { id: string },
        unknown,
        UpdateSupplierInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const supplier = await updateSupplierService(
            request.params.id,
            request.body,
        )

        if (!supplier) {
            response.status(404).json({
                error: {
                    code: 'SUPPLIER_NOT_FOUND',
                    message: 'Supplier not found.',
                },
            })

            return
        }

        response.status(200).json({
            data: supplier,
        })
    } catch (error) {
        next(error)
    }
}

export async function deleteSupplier(
    request: Request<{ id: string }>,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const deleted = await deleteSupplierService(
            request.params.id,
        )

        if (!deleted) {
            response.status(404).json({
                error: {
                    code: 'SUPPLIER_NOT_FOUND',
                    message: 'Supplier not found.',
                },
            })

            return
        }

        response.status(204).send()
    } catch (error) {
        next(error)
    }
}