import { AppError } from '../../errors/AppError.js'
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
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const organizationId =
            getOrganizationId(request)

        if (!organizationId) {
            throw new AppError(
                401,
                'AUTHENTICATION_REQUIRED',
                'Authentication is required.',
            )
        }

        const suppliers =
            await listSuppliers(organizationId)

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
        const organizationId =
            getOrganizationId(request)

        const supplier = await getSupplierById(
            request.params.id,
            organizationId,
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
        const organizationId = getOrganizationId(request)

        const supplier = await createSupplierService(
            request.body,
            organizationId,
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

        const organizationId = getOrganizationId(request)
        const supplier = await updateSupplierService(
            request.params.id,
            request.body,
            organizationId,
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

        const organizationId = getOrganizationId(request)
        const deleted = await deleteSupplierService(
            request.params.id,
            organizationId
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

function getOrganizationId(
    request: Request,
): string {
    const organizationId =
        request.session.user?.organizationId

    if (!organizationId) {
        throw new AppError(
            401,
            'AUTHENTICATION_REQUIRED',
            'Authentication is required.',
        )
    }

    return organizationId
}