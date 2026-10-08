import {
    beforeEach,
    expect,
    test,
    vi,
} from 'vitest'

import { databasePool } from '../../config/database.js'
import {
    findSupplierById,
} from './supplier.repository.js'

vi.mock('../../config/database.js', () => ({
    databasePool: {
        query: vi.fn(),
    },
}))

const mockedQuery =
    vi.mocked(databasePool.query)

beforeEach(() => {
    vi.clearAllMocks()
})

test('scopes supplier lookup to the requested organization', async () => {
    mockedQuery.mockResolvedValue({
        rows: [],
    } as never)

    const result =
        await findSupplierById(
            'SUP-001',
            'org-001',
        )

    expect(mockedQuery).toHaveBeenCalledWith(
        expect.stringContaining(
            'AND supplier.organization_id = $2',
        ),
        [
            'SUP-001',
            'org-001',
        ],
    )

    expect(result).toBeNull()
})