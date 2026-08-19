import pg from 'pg'

const { Pool } = pg

export const databasePool = new Pool()

databasePool.on('error', (error) => {
    console.error(
        'Unexpected PostgreSQL pool error:',
        error,
    )
})