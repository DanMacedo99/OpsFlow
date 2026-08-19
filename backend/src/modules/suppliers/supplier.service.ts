import { findAllSuppliers, findSupplierById } from './supplier.repository.js'
import type { Supplier } from './supplier.types.js'

export function listSuppliers(): Promise<Supplier[]> {
    return findAllSuppliers()
}

export function getSupplierById(id: string): Promise<Supplier | null> {
    return findSupplierById(id)
}
