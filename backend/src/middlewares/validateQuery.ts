import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import type { ZodType } from 'zod'

export function validateQuery(schema: ZodType) {
    return function queryValidationMiddleware(
        request: Request,
        response: Response,
        next: NextFunction,
    ): void {
        const validationResult = schema.safeParse(
            request.query,
        )

        if (!validationResult.success) {
            response.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message:
                        'Invalid request query.',
                    details:
                        validationResult.error.issues.map(
                            (issue) => ({
                                field:
                                    issue.path.join('.') ||
                                    'query',
                                message: issue.message,
                            }),
                        ),
                },
            })

            return
        }

        response.locals.validatedQuery =
            validationResult.data

        next()
    }
}