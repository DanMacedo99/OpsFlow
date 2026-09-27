import { Router } from 'express'
import { validateBody } from '../../middlewares/validateBody.js'
import { requireAuthentication } from '../../middlewares/requireAuthentication.js'
import {
    loginController,
    register,
    logoutController,
    getCurrentUserController
} from './auth.controller.js'
import { registerAccountSchema } from './auth.schema.js'

export const authRouter = Router()


authRouter.post(
    '/register',
    validateBody(registerAccountSchema),
    register,
)

authRouter.post(
    '/login',
    loginController,
)

authRouter.post(
    '/logout',
    logoutController,
)

authRouter.get(
    '/me',
    requireAuthentication,
    getCurrentUserController,
)