import { randomUUID } from 'node:crypto'

import {
    findAllSuppliers,
    findSupplierById,
    updateSupplierRecord,
    insertSupplier,
    deleteSupplierById,
} from './supplier.repository.js'

import type {
    CreateSupplierInput,
    UpdateSupplierInput,
} from './supplier.schema.js'
import type { Supplier } from './supplier.types.js'
import { request } from 'express'


export function listSuppliers(
    organizationId: string,
): Promise<Supplier[]> {
    return findAllSuppliers(organizationId)
}

export function getSupplierById(
    id: string,
    organizationId: string,
): Promise<Supplier | null> {
    return findSupplierById(
        id,
        organizationId,
    )
}

export function createSupplier(
    input: CreateSupplierInput,
    organizationId: string,
): Promise<Supplier> {

    const supplier: Supplier = {
        id: createSupplierId(),
        ...input,
    }

    return insertSupplier(supplier, organizationId)
}

function createSupplierId(): string {
    const randomPart = randomUUID()
        .slice(0, 8)
        .toUpperCase()

    return `SUP-${randomPart}`
}

export function updateSupplier(
    id: string,
    input: UpdateSupplierInput,
    organizationId: string,
): Promise<Supplier | null> {
    const supplier: Supplier = {
        id,
        ...input,
    }

    return updateSupplierRecord(supplier, organizationId)
}

export function deleteSupplier(
    id: string,
    organizationId: string,
): Promise<boolean> {
    return deleteSupplierById(id, organizationId)
}
