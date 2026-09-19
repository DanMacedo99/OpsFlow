import { randomUUID } from 'node:crypto'
import {
    findAllSuppliers,
    findSupplierById,
    updateSupplierRecord,
    insertSupplier,
    deleteSupplierById,
    findSupplierByIdForUpdate,
} from './supplier.repository.js'
import type {
    CreateSupplierInput,
    UpdateSupplierInput,
} from './supplier.schema.js'
import type { Supplier } from './supplier.types.js'
import { runInTransaction } from '../../config/database.js'
import { insertAuditLog } from '../audit-logs/auditLog.repository.js'

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
    actorUserId: string,
): Promise<Supplier> {
    const supplier: Supplier = {
        id: createSupplierId(),
        ...input,
    }

    return runInTransaction(async (client) => {
        const createdSupplier =
            await insertSupplier(
                client,
                supplier,
                organizationId,
            )

        await insertAuditLog(client, {
            organizationId,
            actorUserId,
            action: 'supplier.created',
            entityType: 'supplier',
            entityId: createdSupplier.id,
            metadata: {
                name: createdSupplier.name,
                category: createdSupplier.category,
                country: createdSupplier.country,
            },
        })

        return createdSupplier
    })
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
    actorUserId: string,
): Promise<Supplier | null> {
    const supplier: Supplier = {
        id,
        ...input,
    }

    return runInTransaction(async (client) => {
        const previousSupplier = await findSupplierByIdForUpdate(client, id, organizationId)

        if (!previousSupplier) {
            return null
        }

        const updatedSupplier = await updateSupplierRecord(
            client,
            supplier,
            organizationId,
        )

        if (!updatedSupplier) {
            throw new Error(
                'Supplier disappeared during the update transaction.',
            )
        }



        await insertAuditLog(client, {
            organizationId,
            actorUserId,
            action: 'supplier.updated',
            entityType: 'supplier',
            entityId: updatedSupplier.id,
            metadata: {
                previous: {
                    name: previousSupplier.name,
                    category: previousSupplier.category,
                    country: previousSupplier.country,
                    riskLevel:
                        previousSupplier.riskLevel,
                    assessmentStatus:
                        previousSupplier.assessmentStatus,
                    complianceScore:
                        previousSupplier.complianceScore,
                    lastAssessmentDate:
                        previousSupplier.lastAssessmentDate,
                },
                updated: {
                    name: updatedSupplier.name,
                    category: updatedSupplier.category,
                    country: updatedSupplier.country,
                    riskLevel:
                        updatedSupplier.riskLevel,
                    assessmentStatus:
                        updatedSupplier.assessmentStatus,
                    complianceScore:
                        updatedSupplier.complianceScore,
                    lastAssessmentDate:
                        updatedSupplier.lastAssessmentDate,
                },
            },
        })

        return updatedSupplier
    })
}

export function deleteSupplier(
    id: string,
    organizationId: string,
    actorUserId: string,
): Promise<boolean> {
    return runInTransaction(async (client) => {
        const supplier =
            await findSupplierByIdForUpdate(
                client,
                id,
                organizationId,
            )

        if (!supplier) {
            return false
        }
        const deleted = await deleteSupplierById(
            client,
            id,
            organizationId,
        )

        if (!deleted) {
            throw new Error(
                'Supplier disappeared during the deletion transaction.',
            )
        }

        await insertAuditLog(client, {
            organizationId,
            actorUserId,
            action: 'supplier.deleted',
            entityType: 'supplier',
            entityId: supplier.id,
            metadata: {
                name: supplier.name,
                category: supplier.category,
                country: supplier.country,
                riskLevel: supplier.riskLevel,
                assessmentStatus:
                    supplier.assessmentStatus,
                complianceScore:
                    supplier.complianceScore,
                lastAssessmentDate:
                    supplier.lastAssessmentDate,
            },
        })

        return true
    })
}