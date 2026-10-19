import type {
    ErrorRequestHandler,
} from 'express'

import multer from 'multer'

import { AppError } from '../errors/AppError.js'

export const errorHandler: ErrorRequestHandler = (
    error,
    _request,
    response,
    next,
): void => {
    if (response.headersSent) {
        next(error)
        return
    }

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            response.status(413).json({
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: 'PDF must be 5 MB or smaller.',
                },
            })

            return
        }

        response.status(400).json({
            error: {
                code: 'INVALID_UPLOAD',
                message: 'Invalid file upload.',
            },
        })

        return
    }

    if (
        error instanceof SyntaxError &&
        'type' in error &&
        error.type === 'entity.parse.failed'
    ) {
        response.status(400).json({
            error: {
                code: 'INVALID_JSON',
                message:
                    'Request body contains invalid JSON.',
            },
        })

        return
    }

    if (error instanceof AppError) {
        response.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
            },
        })

        return
    }

    console.error(
        'Unhandled application error:',
        error,
    )

    response.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message:
                'An unexpected error occurred.',
        },
    })
}