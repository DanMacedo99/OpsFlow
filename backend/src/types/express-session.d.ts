import 'express-session'

declare module 'express-session' {
    interface SessionData {
        user?: {
            id: string
            organizationId: string
            role: string
        }
    }
}