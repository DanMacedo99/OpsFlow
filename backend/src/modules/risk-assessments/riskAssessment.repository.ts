import { databasePool } from '../../config/database.js'
import type { PoolClient } from 'pg'
import type {
    RiskAssessment,
    CreateRiskAssessmentRecord,
    UpdateRiskAssessmentDecisionRecord,
    UpdateRiskAssessmentDocumentStatusRecord,
} from './riskAssessment.types.js'

export async function findRiskAssessmentsBySupplierId(
    supplierId: string,
    organizationId: string,
): Promise<RiskAssessment[]> {
    const result =
        await databasePool.query<RiskAssessment>(
            `
                SELECT
                    assessment.id,
                    assessment.supplier_id AS "supplierId",
                    assessment.risk_score AS "riskScore",
                    assessment.risk_level AS "riskLevel",
                    assessment.compliance_score AS "complianceScore",
                    assessment.decision,
                    assessment.document_status AS "documentStatus",
                    assessment.assessment_date::text AS "assessmentDate",
                    assessment.review_date::text AS "reviewDate",
                    assessment.notes,
                    assessment.created_at AS "createdAt",
                    assessment.updated_at AS "updatedAt"
                FROM risk_assessments AS assessment

                INNER JOIN suppliers AS supplier
                    ON supplier.id = assessment.supplier_id

               WHERE assessment.supplier_id = $1
                    AND supplier.organization_id = $2

                    ORDER BY assessment.created_at DESC
            `,
            [supplierId, organizationId],
        )

    return result.rows
}

export async function insertRiskAssessment(
    client: PoolClient,
    input: CreateRiskAssessmentRecord,
    organizationId: string,
): Promise<RiskAssessment | null> {

    const assessmentResult = await client.query<RiskAssessment>(

        `
                    INSERT INTO risk_assessments (
                        supplier_id,
                        risk_score,
                        risk_level,
                        compliance_score,
                        document_status,
                        notes
                    )
                        SELECT
                        supplier.id,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    FROM suppliers AS supplier
                    WHERE supplier.id = $1
                        AND supplier.organization_id = $7
                    RETURNING
                        id,
                        supplier_id AS "supplierId",
                        risk_score AS "riskScore",
                        risk_level AS "riskLevel",
                        compliance_score AS "complianceScore",
                        decision,
                        document_status AS "documentStatus",
                        assessment_date::text AS "assessmentDate",
                        review_date::text AS "reviewDate",
                        notes,
                        created_at AS "createdAt",
                        updated_at AS "updatedAt"
                `,
        [
            input.supplierId,
            input.riskScore,
            input.riskLevel,
            input.complianceScore,
            input.documentStatus,
            input.notes,
            organizationId,
        ],
    )

    const assessment = assessmentResult.rows[0]

    if (!assessment) {
        return null
    }

    for (const response of input.responses) {
        await client.query(
            `
                    INSERT INTO risk_assessment_responses (
                        assessment_id,
                        criterion_key,
                        score,
                        criterion_weight,
                        notes
                    )
                    VALUES ($1, $2, $3, $4, $5)
                `,
            [
                assessment.id,
                response.criterionKey,
                response.score,
                response.weight,
                response.notes,
            ],
        )
    }

    return assessment
}

export async function findRiskAssessmentById(
    client: PoolClient,
    supplierId: string,
    assessmentId: string,
    organizationId: string,
): Promise<RiskAssessment | null> {
    const result = await client.query<RiskAssessment>(
        `
            SELECT
                id,
                supplier_id AS "supplierId",
                risk_score AS "riskScore",
                risk_level AS "riskLevel",
                compliance_score AS "complianceScore",
                decision,
                document_status AS "documentStatus",
                assessment_date::text AS "assessmentDate",
                review_date::text AS "reviewDate",
                notes,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
            FROM risk_assessments
            WHERE supplier_id = $1
              AND id = $2
                AND EXISTS (
                    SELECT 1
                    FROM suppliers AS supplier
                    WHERE supplier.id = risk_assessments.supplier_id
                        AND supplier.organization_id = $3
  )
                        FOR UPDATE

        `,
        [supplierId, assessmentId, organizationId],
    )

    return result.rows[0] ?? null
}

export async function updateRiskAssessmentDecision(
    client: PoolClient,
    input: UpdateRiskAssessmentDecisionRecord,
    organizationId: string,
): Promise<RiskAssessment | null> {
    const result = await client.query<RiskAssessment>(
        `
            UPDATE risk_assessments
            SET
                decision = $3,
                assessment_date = $4,
                review_date = $5,
                updated_at = current_timestamp
            WHERE id = $1
              AND supplier_id = $2
              AND decision = 'pending'
              AND EXISTS (
                    SELECT 1
                    FROM suppliers AS supplier
                    WHERE supplier.id = risk_assessments.supplier_id
                    AND supplier.organization_id = $6
)
            RETURNING
                id,
                supplier_id AS "supplierId",
                risk_score AS "riskScore",
                risk_level AS "riskLevel",
                compliance_score AS "complianceScore",
                decision,
                document_status AS "documentStatus",
                assessment_date::text AS "assessmentDate",
                review_date::text AS "reviewDate",
                notes,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `,
        [
            input.assessmentId,
            input.supplierId,
            input.decision,
            input.assessmentDate,
            input.reviewDate,
            organizationId,
        ],
    )

    return result.rows[0] ?? null
}

export async function updateRiskAssessmentDocumentStatus(
    client: PoolClient,
    input: UpdateRiskAssessmentDocumentStatusRecord,
    organizationId: string,
): Promise<RiskAssessment | null> {
    const result = await client.query<RiskAssessment>(
        `
            UPDATE risk_assessments
            SET
                document_status = $3,
                updated_at = current_timestamp
            WHERE id = $1
              AND supplier_id = $2
              AND EXISTS (
                    SELECT 1
                    FROM suppliers AS supplier
                    WHERE supplier.id = risk_assessments.supplier_id
                    AND supplier.organization_id = $4
                )
            RETURNING
                id,
                supplier_id AS "supplierId",
                risk_score AS "riskScore",
                risk_level AS "riskLevel",
                compliance_score AS "complianceScore",
                decision,
                document_status AS "documentStatus",
                assessment_date::text AS "assessmentDate",
                review_date::text AS "reviewDate",
                notes,
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `,
        [
            input.assessmentId,
            input.supplierId,
            input.documentStatus,
            organizationId,
        ],
    )

    return result.rows[0] ?? null
}