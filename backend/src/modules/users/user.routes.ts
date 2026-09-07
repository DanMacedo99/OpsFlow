import { Router } from 'express'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateBody } from '../../middlewares/validateBody.js'
import {
    createUser,
    getUsers,
    updateUserRole,
} from './user.controller.js'
import {
    createUserSchema,
    updateUserRoleSchema
} from './user.schema.js'

export const userRouter = Router()

userRouter.get(
    '/',
    requireRole('admin'),
    getUsers,
)

userRouter.post(
    '/',
    requireRole('admin'),
    validateBody(createUserSchema),
    createUser,
)

userRouter.patch(
    '/:id/role',
    requireRole('admin'),
    validateBody(updateUserRoleSchema),
    updateUserRole,
)