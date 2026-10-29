import { z } from 'zod'

export const documentReviewSchema = z.object({
    reviewStatus: z.enum([
        'accepted',
        'rejected',
        'needs_follow_up',
    ]),

    reviewComment: z
        .string()
        .trim()
        .max(2000)
        .nullable()
        .optional(),
})

export type DocumentReviewInput =
    z.infer<typeof documentReviewSchema>