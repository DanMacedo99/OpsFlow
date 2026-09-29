import type { UserRole } from './auth'

export interface CreateUserInput {
    name: string
    email: string
    password: string
    role: UserRole
}

export interface UpdateUserRoleInput {
    role: UserRole
}