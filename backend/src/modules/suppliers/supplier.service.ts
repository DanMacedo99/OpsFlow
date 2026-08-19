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

export function listSuppliers(): Promise<Supplier[]> {
    return findAllSuppliers()
}

export function getSupplierById(
    id: string,
): Promise<Supplier | null> {
    return findSupplierById(id)
}

export function createSupplier(
    input: CreateSupplierInput,
): Promise<Supplier> {
    const supplier: Supplier = {
        id: createSupplierId(),
        ...input,
    }

    return insertSupplier(supplier)
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
): Promise<Supplier | null> {
    const supplier: Supplier = {
        id,
        ...input,
    }

    return updateSupplierRecord(supplier)
}

export function deleteSupplier(
    id: string,
): Promise<boolean> {
    return deleteSupplierById(id)
}
