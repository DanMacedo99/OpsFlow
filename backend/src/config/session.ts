import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'

import { databasePool } from './database.js'
import { env } from './env.js'

const PostgreSQLSessionStore =
    connectPgSimple(session)

export const sessionMiddleware = session({
    name: 'opsflow.sid',

    store: new PostgreSQLSessionStore({
        pool: databasePool,
        tableName: 'sessions',
    }),

    secret: env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.SESSION_COOKIE_SAME_SITE,
        maxAge: 1000 * 60 * 60 * 8,
    },
})