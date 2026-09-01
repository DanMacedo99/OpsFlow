import express from 'express'
import { sessionMiddleware } from './config/session.js'
import { env } from './config/env.js'
import cors from 'cors'
import { supplierRouter } from './modules/suppliers/supplier.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { requireAuthentication } from './middlewares/requireAuthentication.js'
import { authRouter } from './modules/auth/auth.routes.js'

export const app = express()




app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    }),
)

app.use(express.json())
app.use(sessionMiddleware)

app.get('/health', (_request, response) => {
    response.status(200).json({
        status: 'ok',
        service: 'opsflow-api',
    })
})

app.use('/auth', authRouter)
app.use('/suppliers', requireAuthentication, supplierRouter)

app.use(errorHandler)