import { Router } from 'express'

import { validateBody } from '../../middlewares/validateBody.js'

import { register } from './auth.controller.js'
import { registerAccountSchema } from './auth.schema.js'

export const authRouter = Router()

authRouter.post(
    '/register',
    validateBody(registerAccountSchema),
    register,
)