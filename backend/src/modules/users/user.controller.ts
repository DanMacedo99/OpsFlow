import type {
    NextFunction,
    Request,
    Response,
} from 'express'

import {
    getAuthenticatedOrganizationId,
    getAuthenticatedUser,
} from '../auth/authSession.js'

import {
    changeOrganizationUserRole,
    createOrganizationUser,
    listOrganizationUsers,
} from './user.service.js'

import type {
    CreateUserInput,
    UpdateUserRoleInput,
} from './user.schema.js'

type UserParams = {
    id: string
}

export async function createUser(
    request: Request<
        Record<string, never>,
        unknown,
        CreateUserInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authenticatedUser =
            getAuthenticatedUser(request)

        const user = await createOrganizationUser(
            authenticatedUser.id,
            authenticatedUser.organizationId,
            request.body,
        )

        response.status(201).json({
            data: user,
        })
    } catch (error) {
        next(error)
    }
}

export async function getUsers(
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const organizationId =
            getAuthenticatedOrganizationId(request)

        const users = await listOrganizationUsers(
            organizationId,
        )

        response.status(200).json({
            data: users,
        })
    } catch (error) {
        next(error)
    }
}

export async function updateUserRole(
    request: Request<
        UserParams,
        unknown,
        UpdateUserRoleInput
    >,
    response: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authenticatedUser =
            getAuthenticatedUser(request)

        const user = await changeOrganizationUserRole(
            authenticatedUser.id,
            authenticatedUser.organizationId,
            request.params.id,
            request.body,
        )

        response.status(200).json({
            data: user,
        })
    } catch (error) {
        next(error)
    }
}