import { z } from 'zod'

export const createSupplierSchema = z.strictObject({
    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    category: z
        .string()
        .trim()
        .min(2)
        .max(100),

    country: z
        .string()
        .trim()
        .min(2)
        .max(100),

    riskLevel: z
        .enum([
            'unassessed',
            'low',
            'medium',
            'high',
        ])
        .default('unassessed'),

    assessmentStatus: z
        .enum([
            'approved',
            'pending',
            'review-required',
        ])
        .default('pending'),

    complianceScore: z
        .number()
        .int()
        .min(0)
        .max(100)
        .default(0),

    lastAssessmentDate: z
        .iso
        .date()
        .nullable()
        .default(null),
})

export type CreateSupplierInput = z.infer<
    typeof createSupplierSchema
>

export const updateSupplierSchema = z.strictObject({
    name: z
        .string()
        .trim()
        .min(2)
        .max(150),

    category: z
        .string()
        .trim()
        .min(2)
        .max(100),

    country: z
        .string()
        .trim()
        .min(2)
        .max(100),

    riskLevel: z.enum([
        'unassessed',
        'low',
        'medium',
        'high',
    ]),

    assessmentStatus: z.enum([
        'approved',
        'pending',
        'review-required',
    ]),

    complianceScore: z
        .number()
        .int()
        .min(0)
        .max(100),

    lastAssessmentDate: z
        .iso
        .date()
        .nullable(),
})

export type UpdateSupplierInput = z.infer<
    typeof updateSupplierSchema
>