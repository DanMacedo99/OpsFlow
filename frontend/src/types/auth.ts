export type UserRole =
    | 'admin'
    | 'risk_manager'
    | 'reviewer'
    | 'viewer'

export interface AuthUser {
    id: string
    organizationId: string
    name: string
    email: string
    role: UserRole
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type LoginUser = Pick<
    AuthUser,
    'id' | 'organizationId' | 'name' | 'email' | 'role'
>

export interface LoginInput {
    email: string
    password: string
}

export interface RegisterInput {
    organizationName: string
    name: string
    email: string
    password: string
}

export interface Organization {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

export interface RegistrationResult {
    organization: Organization
    user: AuthUser
}