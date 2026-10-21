import { z } from 'zod'

export const documentAnalysisSchema = z.object({
    supplier: z
        .string()
        .min(1),

    overallStatus: z
        .string()
        .min(1),

    summary: z
        .string()
        .min(1),

    risks: z.array(
        z.object({
            title: z
                .string()
                .min(1),

            severity: z.enum([
                'low',
                'medium',
                'high',
                'critical',
                'unknown',
            ]),

            description: z
                .string()
                .min(1),

            pages: z.array(
                z
                    .number()
                    .int()
                    .positive(),
            ),
        }),
    ),

    inconsistencies: z.array(
        z.object({
            description: z
                .string()
                .min(1),

            pages: z.array(
                z
                    .number()
                    .int()
                    .positive(),
            ),
        }),
    ),

    missingEvidence: z.array(
        z.object({
            description: z
                .string()
                .min(1),

            pages: z.array(
                z
                    .number()
                    .int()
                    .positive(),
            ),
        }),
    ),
})

export type DocumentAnalysis =
    z.infer<typeof documentAnalysisSchema>