import { databasePool } from '../../config/database.js'

import type {
    RiskAssessment,
    CreateRiskAssessmentRecord,
    UpdateRiskAssessmentDecisionRecord
} from './riskAssessment.types.js'

export async function findRiskAssessmentsBySupplierId(
    supplierId: string,
): Promise<RiskAssessment[]> {
    const result =
        await databasePool.query<RiskAssessment>(
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
                ORDER BY created_at DESC
            `,
            [supplierId],
        )

    return result.rows
}

export async function insertRiskAssessment(
    input: CreateRiskAssessmentRecord,
): Promise<RiskAssessment> {
    const client = await databasePool.connect()

    try {
        await client.query('BEGIN')

        const assessmentResult =
            await client.query<RiskAssessment>(
                `
                    INSERT INTO risk_assessments (
                        supplier_id,
                        risk_score,
                        risk_level,
                        compliance_score,
                        document_status,
                        notes
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
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
                ],
            )

        const assessment = assessmentResult.rows[0]

        if (!assessment) {
            throw new Error(
                'Failed to create risk assessment.',
            )
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

        await client.query('COMMIT')

        return assessment
    } catch (error) {
        await client.query('ROLLBACK')

        throw error
    } finally {
        client.release()
    }
}

export async function findRiskAssessmentById(
    supplierId: string,
    assessmentId: string,
): Promise<RiskAssessment | null> {
    const result = await databasePool.query<RiskAssessment>(
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
        `,
        [supplierId, assessmentId],
    )

    return result.rows[0] ?? null
}

export async function updateRiskAssessmentDecision(
    input: UpdateRiskAssessmentDecisionRecord,
): Promise<RiskAssessment | null> {
    const result = await databasePool.query<RiskAssessment>(
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
        ],
    )

    return result.rows[0] ?? null
}