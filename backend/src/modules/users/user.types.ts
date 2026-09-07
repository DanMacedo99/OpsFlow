import type {
    UserRole,
} from '../auth/auth.types.js'

export interface CreateUserRecord {
    organizationId: string
    name: string
    email: string
    passwordHash: string
    role: UserRole
}

export interface UpdateOrganizationUserRoleRecord {
    userId: string
    organizationId: string
    role: UserRole
}