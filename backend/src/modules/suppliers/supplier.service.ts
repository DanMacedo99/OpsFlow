import { findAllSuppliers } from './supplier.repository.js'
import type { Supplier } from './supplier.types.js'

export function listSuppliers(): Promise<Supplier[]> {
    return findAllSuppliers()
}