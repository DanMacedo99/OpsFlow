import { databasePool } from '../../config/database.js'
import type { Supplier } from './supplier.types.js'

export async function findAllSuppliers(): Promise<Supplier[]> {
    const result = await databasePool.query<Supplier>(`
    SELECT
      id,
      name,
      category,
      country,
      risk_level AS "riskLevel",
      assessment_status AS "assessmentStatus",
      compliance_score AS "complianceScore",
      last_assessment_date::text AS "lastAssessmentDate"
    FROM suppliers
    ORDER BY id ASC
  `)

    return result.rows
}

export async function findSupplierById(
    id: string,
): Promise<Supplier | null> {
    const result = await databasePool.query<Supplier>(
        `
      SELECT
        id,
        name,
        category,
        country,
        risk_level AS "riskLevel",
        assessment_status AS "assessmentStatus",
        compliance_score AS "complianceScore",
        last_assessment_date::text AS "lastAssessmentDate"
      FROM suppliers
      WHERE id = $1
    `,
        [id],
    )

    return result.rows[0] ?? null
}