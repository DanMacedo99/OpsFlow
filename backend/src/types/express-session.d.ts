import 'express-session'

import type {
    UserRole,
} from '../modules/auth/auth.types.js'

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string
            organizationId: string
            role: UserRole
        }
    }
}