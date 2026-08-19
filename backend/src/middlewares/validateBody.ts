import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import type { ZodType } from 'zod'

export function validateBody(schema: ZodType) {
    return function bodyValidationMiddleware(
        request: Request,
        response: Response,
        next: NextFunction,
    ): void {
        const validationResult = schema.safeParse(
            request.body,
        )

        if (!validationResult.success) {
            response.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request body.',
                    details: validationResult.error.issues.map(
                        (issue) => ({
                            field:
                                issue.path.join('.') || 'body',
                            message: issue.message,
                        }),
                    ),
                },
            })

            return
        }

        request.body = validationResult.data

        next()
    }
}