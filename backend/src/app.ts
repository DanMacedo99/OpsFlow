import express from 'express'
import { supplierRouter } from './modules/suppliers/supplier.routes.js'

export const app = express()

app.use(express.json())

app.get('/health', (_request, response) => {
    response.status(200).json({
        status: 'ok',
        service: 'opsflow-api',
    })
})

app.use('/suppliers', supplierRouter)