import 'dotenv/config'
import { app } from './app.js'
import { databasePool } from './config/database.js'

const port = Number(process.env.PORT ?? 3000)

if (Number.isNaN(port)) {
    throw new Error('PORT must be a valid number.')
}

async function startServer(): Promise<void> {
    try {
        await databasePool.query('SELECT 1')

        console.log('Connected to PostgreSQL.')

        app.listen(port, () => {
            console.log(
                `OpsFlow API running at http://localhost:${port}`,
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