import { databasePool } from '../../config/database.js'
import 'dotenv/config'

const suppliers = [
    {
        id: 'SUP-001',
        name: 'Northstar Logistics',
        category: 'Logistics',
        country: 'Ireland',
        riskLevel: 'high',
        assessmentStatus: 'review-required',
        complianceScore: 64,
        lastAssessmentDate: '2026-08-10',
    },
    {
        id: 'SUP-002',
        name: 'BlueWave Technologies',
        category: 'Technology',
        country: 'Germany',
        riskLevel: 'medium',
        assessmentStatus: 'pending',
        complianceScore: 78,
        lastAssessmentDate: '2026-08-08',
    },
    {
        id: 'SUP-003',
        name: 'GreenFields Packaging',
        category: 'Packaging',
        country: 'United Kingdom',
        riskLevel: 'low',
        assessmentStatus: 'approved',
        complianceScore: 96,
        lastAssessmentDate: '2026-08-04',
    },
    {
        id: 'SUP-004',
        name: 'MedCore Supplies',
        category: 'Healthcare',
        country: 'France',
        riskLevel: 'high',
        assessmentStatus: 'pending',
        complianceScore: 58,
        lastAssessmentDate: '2026-07-29',
    },
] as const

async function seedSuppliers(): Promise<void> {
    const client = await databasePool.connect()

    try {
        await client.query('BEGIN')

        let insertedSuppliers = 0

        for (const supplier of suppliers) {
            const result = await client.query(
                `
          INSERT INTO suppliers (
            id,
            name,
            category,
            country,
            risk_level,
            assessment_status,
            compliance_score,
            last_assessment_date
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `,
                [
                    supplier.id,
                    supplier.name,
                    supplier.category,
                    supplier.country,
                    supplier.riskLevel,
                    supplier.assessmentStatus,
                    supplier.complianceScore,
                    supplier.lastAssessmentDate,
                ],
            )

            insertedSuppliers += result.rowCount ?? 0
        }

        await client.query('COMMIT')

        const existingSuppliers =
            suppliers.length - insertedSuppliers

        console.log(
            `Seed completed: ${insertedSuppliers} inserted, ` +
            `${existingSuppliers} already existed.`,
        )
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

void seedSuppliers()
    .catch((error: unknown) => {
        console.error('Failed to seed suppliers:', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await databasePool.end()
    })