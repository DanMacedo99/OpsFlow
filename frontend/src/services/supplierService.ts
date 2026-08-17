import { mockSuppliers } from '../data/suppliers'
import type {
    Supplier,
    SupplierFormData,
} from '../types/supplier'

let suppliers = mockSuppliers.map((supplier) => ({
    ...supplier,
}))

function createNextSupplierId() {
    const highestId = suppliers.reduce((highest, supplier) => {
        const numericId = Number(
            supplier.id.replace('SUP-', ''),
        )

        if (Number.isNaN(numericId)) {
            return highest
        }

        return Math.max(highest, numericId)
    }, 0)

    return `SUP-${String(highestId + 1).padStart(3, '0')}`
}

export function getSuppliers(): Promise<Supplier[]> {
    return Promise.resolve(
        suppliers.map((supplier) => ({ ...supplier })),
    )
}

export function createSupplier(
    input: SupplierFormData,
): Promise<Supplier> {
    const newSupplier: Supplier = {
        id: createNextSupplierId(),
        ...input,
        riskLevel: 'unassessed',
        assessmentStatus: 'pending',
        complianceScore: 0,
        lastAssessmentDate: null,
    }

    suppliers = [newSupplier, ...suppliers]

    return Promise.resolve({ ...newSupplier })
}

export function updateSupplier(
    supplierId: string,
    input: SupplierFormData,
): Promise<Supplier> {
    const existingSupplier = suppliers.find(
        (supplier) => supplier.id === supplierId,
    )

    if (!existingSupplier) {
        return Promise.reject(
            new Error('Supplier not found.'),
        )
    }

    const updatedSupplier: Supplier = {
        ...existingSupplier,
        ...input,
    }

    suppliers = suppliers.map((supplier) =>
        supplier.id === supplierId
            ? updatedSupplier
            : supplier,
    )

    return Promise.resolve({ ...updatedSupplier })
}

export function deleteSupplier(
    supplierId: string,
): Promise<void> {
    const supplierExists = suppliers.some(
        (supplier) => supplier.id === supplierId,
    )

    if (!supplierExists) {
        return Promise.reject(
            new Error('Supplier not found.'),
        )
    }

    suppliers = suppliers.filter(
        (supplier) => supplier.id !== supplierId,
    )

    return Promise.resolve()
}