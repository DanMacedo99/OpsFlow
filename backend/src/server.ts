import { env } from './config/env.js'
import { app } from './app.js'
import { databasePool } from './config/database.js'
import {
    createServer,
} from 'node:http'
import {
    initializeSocketServer,
} from './realtime/socket.js'

const httpServer =
    createServer(app)

    initializeSocketServer(httpServer)

async function startServer(): Promise<void> {
    try {
        await databasePool.query('SELECT 1')

        console.log('Connected to PostgreSQL.')

      httpServer.listen(
            env.PORT,
            () => {
                console.log(
                    `OpsFlow API running at http://localhost:${env.PORT}`,
                )
            },
        )
        
    } catch (error) {
        console.error(
            'Could not connect to PostgreSQL:',
            error,
        )

        process.exit(1)
    }
}

void startServer()