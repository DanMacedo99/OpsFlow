import { env } from './config/env.js'
import { app } from './app.js'
import { databasePool } from './config/database.js'

async function startServer(): Promise<void> {
    try {
        await databasePool.query('SELECT 1')

        console.log('Connected to PostgreSQL.')

        app.listen(env.PORT, () => {
            console.log(
                `OpsFlow API running at http://localhost:${env.PORT}`,
            )
        })
    } catch (error) {
        console.error(
            'Could not connect to PostgreSQL:',
            error,
        )

        process.exit(1)
    }
}

void startServer()