export type UserRole =
    | 'admin'
    | 'risk_manager'
    | 'reviewer'
    | 'viewer'

export interface Organization {
    id: string
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

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

export interface StoredUser extends AuthUser {
    passwordHash: string
}

export interface RegisterAccountRecord {
    organizationName: string
    organizationSlug: string
    userName: string
    email: string
    passwordHash: string
}

export interface RegistrationResult {
    organization: Organization
    user: AuthUser
}