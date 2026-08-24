import { z } from 'zod'

import { assessmentCriteria } from './riskAssessment.criteria.js'

const criterionKeySchema = z.enum([
    'information-security',
    'data-protection',
    'regulatory-compliance',
    'operational-resilience',
    'financial-stability',
])

const criterionResponseSchema = z.object({
    criterionKey: criterionKeySchema,
    score: z.number().int().min(0).max(100),
    notes: z
        .string()
        .trim()
        .max(1000)
        .nullable()
        .optional()
        .default(null),
})

export const createRiskAssessmentSchema = z.object({
    responses: z
        .array(criterionResponseSchema)
        .length(assessmentCriteria.length)
        .refine(
            (responses) =>
                new Set(
                    responses.map(
                        (response) =>
                            response.criterionKey,
                    ),
                ).size === responses.length,
            {
                message:
                    'Each assessment criterion must be provided exactly once.',
            },
        ),
    documentStatus: z
        .enum([
            'missing',
            'pending',
            'verified',
            'expired',
        ])
        .default('pending'),
    notes: z
        .string()
        .trim()
        .max(2000)
        .nullable()
        .optional()
        .default(null),
})

export type CreateRiskAssessmentInput = z.infer<
    typeof createRiskAssessmentSchema
>