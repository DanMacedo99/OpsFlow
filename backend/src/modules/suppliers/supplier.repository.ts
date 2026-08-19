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

export async function insertSupplier(
  supplier: Supplier,
): Promise<Supplier> {
  const result = await databasePool.query<Supplier>(
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
      RETURNING
        id,
        name,
        category,
        country,
        risk_level AS "riskLevel",
        assessment_status AS "assessmentStatus",
        compliance_score AS "complianceScore",
        last_assessment_date::text AS "lastAssessmentDate"
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

  const createdSupplier = result.rows[0]

  if (!createdSupplier) {
    throw new Error(
      'PostgreSQL did not return the created supplier.',
    )
  }

  return createdSupplier
}

export async function updateSupplierRecord(
  supplier: Supplier,
): Promise<Supplier | null> {
  const result = await databasePool.query<Supplier>(
    `
      UPDATE suppliers
      SET
        name = $2,
        category = $3,
        country = $4,
        risk_level = $5,
        assessment_status = $6,
        compliance_score = $7,
        last_assessment_date = $8,
        updated_at = current_timestamp
      WHERE id = $1
      RETURNING
        id,
        name,
        category,
        country,
        risk_level AS "riskLevel",
        assessment_status AS "assessmentStatus",
        compliance_score AS "complianceScore",
        last_assessment_date::text AS "lastAssessmentDate"
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

  return result.rows[0] ?? null
}

export async function deleteSupplierById(
  id: string,
): Promise<boolean> {
  const result = await databasePool.query(
    `
      DELETE FROM suppliers
      WHERE id = $1
    `,
    [id],
  )

  return (result.rowCount ?? 0) > 0
}