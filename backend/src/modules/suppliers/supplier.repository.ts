import { databasePool } from '../../config/database.js'
import type { Supplier } from './supplier.types.js'

export async function findAllSuppliers(): Promise<Supplier[]> {
  const result = await databasePool.query<Supplier>(`
    SELECT
      supplier.id,
      supplier.name,
      supplier.category,
      supplier.country,

      COALESCE(
        latest_assessment.risk_level,
        'unassessed'
      ) AS "riskLevel",

      CASE
        WHEN latest_assessment.id IS NULL
          THEN 'pending'

        WHEN latest_assessment.decision = 'pending'
          THEN 'pending'

        WHEN latest_assessment.decision = 'rejected'
          THEN 'review-required'

        WHEN latest_assessment.document_status = 'expired'
          THEN 'review-required'

        WHEN latest_assessment.review_date <= CURRENT_DATE
          THEN 'review-required'

        WHEN latest_assessment.decision = 'approved'
          AND latest_assessment.document_status = 'verified'
          THEN 'approved'

        ELSE 'review-required'
      END AS "assessmentStatus",

      COALESCE(
        latest_assessment.compliance_score,
        0
      ) AS "complianceScore",

      latest_assessment.assessment_date::text
        AS "lastAssessmentDate"

    FROM suppliers AS supplier

    LEFT JOIN LATERAL (
      SELECT
        assessment.id,
        assessment.risk_level,
        assessment.compliance_score,
        assessment.decision,
        assessment.document_status,
        assessment.assessment_date,
        assessment.review_date
      FROM risk_assessments AS assessment
      WHERE assessment.supplier_id = supplier.id
      ORDER BY
        assessment.created_at DESC,
        assessment.id DESC
      LIMIT 1
    ) AS latest_assessment ON true

    ORDER BY supplier.id ASC
  `)

  return result.rows
}

export async function findSupplierById(
  id: string,
): Promise<Supplier | null> {
  const result = await databasePool.query<Supplier>(
    `
      SELECT
        supplier.id,
        supplier.name,
        supplier.category,
        supplier.country,

        COALESCE(
          latest_assessment.risk_level,
          'unassessed'
        ) AS "riskLevel",

        CASE
          WHEN latest_assessment.id IS NULL
            THEN 'pending'

          WHEN latest_assessment.decision = 'pending'
            THEN 'pending'

          WHEN latest_assessment.decision = 'rejected'
            THEN 'review-required'

          WHEN latest_assessment.document_status = 'expired'
            THEN 'review-required'

          WHEN latest_assessment.review_date <= CURRENT_DATE
            THEN 'review-required'

          WHEN latest_assessment.decision = 'approved'
            AND latest_assessment.document_status = 'verified'
            THEN 'approved'

          ELSE 'review-required'
        END AS "assessmentStatus",

        COALESCE(
          latest_assessment.compliance_score,
          0
        ) AS "complianceScore",

        latest_assessment.assessment_date::text
          AS "lastAssessmentDate"

      FROM suppliers AS supplier

      LEFT JOIN LATERAL (
        SELECT
          assessment.id,
          assessment.risk_level,
          assessment.compliance_score,
          assessment.decision,
          assessment.document_status,
          assessment.assessment_date,
          assessment.review_date
        FROM risk_assessments AS assessment
        WHERE assessment.supplier_id = supplier.id
        ORDER BY
          assessment.created_at DESC,
          assessment.id DESC
        LIMIT 1
      ) AS latest_assessment ON true

      WHERE supplier.id = $1
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