import pg from 'pg'
import { PoolClient } from 'pg'

const { Pool } = pg

export const databasePool = new Pool()

databasePool.on('error', (error) => {
    console.error(
        'Unexpected PostgreSQL pool error:',
        error,
    )
})

export async function runInTransaction<T>(
    operation: (
        client: PoolClient,
    ) => Promise<T>,
): Promise<T> {
    const client = await databasePool.connect()

    try {
        await client.query('BEGIN')

        const result = await operation(client)

        await client.query('COMMIT')

        return result
    } catch (error) {
        await client.query('ROLLBACK')

        throw error
    } finally {
        client.release()
    }
}