import request from 'supertest'
import type {
    NextFunction,
    Request,
    Response,
} from 'express'
import {
    beforeEach,
    expect,
    test,
    vi,
} from 'vitest'

import { app } from './app.js'

import {
    createSupplier,
    getSupplierById,
    listSuppliers,
} from './modules/suppliers/supplier.service.js'

vi.mock('./middlewares/requireAuthentication.js', () => ({
    requireAuthentication: (
        _request: Request,
        _response: Response,
        next: NextFunction,
    ) => next(),
}))

vi.mock('./middlewares/requireRole.js', () => ({
    requireRole: () => (
        _request: Request,
        _response: Response,
        next: NextFunction,
    ) => next(),
}))

vi.mock('./modules/auth/authSession.js', () => ({
    getAuthenticatedOrganizationId: vi.fn(
        () => 'org-001',
    ),
    getAuthenticatedUser: vi.fn(),
}))

vi.mock('./modules/suppliers/supplier.service.js', () => ({
    createSupplier: vi.fn(),
    deleteSupplier: vi.fn(),
    getSupplierById: vi.fn(),
    listSuppliers: vi.fn(),
    updateSupplier: vi.fn(),
}))

const mockedCreateSupplier =
    vi.mocked(createSupplier)

const mockedListSuppliers =
    vi.mocked(listSuppliers)
    
const mockedGetSupplierById =
    vi.mocked(getSupplierById)

beforeEach(() => {
    vi.clearAllMocks()
})

test('GET /health returns the API health status', async () => {
    const response =
        await request(app)
            .get('/health')

    expect(response.status).toBe(200)

    expect(response.body).toEqual({
        status: 'ok',
        service: 'opsflow-api',
    })
})

test('GET /suppliers returns suppliers', async () => {
    mockedListSuppliers.mockResolvedValue([])

    const response =
        await request(app)
            .get('/suppliers')

    expect(response.status).toBe(200)

    expect(response.body).toEqual({
        data: [],
    })

    expect(
        mockedListSuppliers,
    ).toHaveBeenCalledWith(
        'org-001',
    )
})

test('GET /suppliers/:id returns 404 when supplier does not exist', async () => {
    mockedGetSupplierById
        .mockResolvedValue(null)

    const response =
        await request(app)
            .get('/suppliers/SUP-999')

    expect(response.status).toBe(404)

    expect(response.body).toEqual({
        error: {
            code: 'SUPPLIER_NOT_FOUND',
            message: 'Supplier not found.',
        },
    })

    expect(
        mockedGetSupplierById,
    ).toHaveBeenCalledWith(
        'SUP-999',
        'org-001',
    )
})

test('POST /suppliers returns 400 when request body is invalid', async () => {
    const response =
        await request(app)
            .post('/suppliers')
            .send({})

    expect(response.status).toBe(400)

    expect(
        mockedCreateSupplier,
    ).not.toHaveBeenCalled()
})