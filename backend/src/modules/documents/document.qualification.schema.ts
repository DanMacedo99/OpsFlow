import { z } from 'zod'

export const documentQualificationSchema = z.object({
    detectedSupplier: z
        .string()
        .min(1)
        .nullable(),

    supplierMatch: z.enum([
        'match',
        'mismatch',
        'uncertain',
    ]),

    relevance: z.enum([
        'relevant',
        'irrelevant',
        'uncertain',
    ]),

    documentType: z
        .string()
        .min(1),

    reason: z
        .string()
        .min(1),
})

export type DocumentQualification =
    z.infer<
        typeof documentQualificationSchema
    >