import 'dotenv/config'
import { app } from './app.js'


const port = Number(process.env.PORT ?? 3000)

if (Number.isNaN(port)) {
    throw new Error('PORT must be a valid number.')
}

app.listen(port, () => {
    console.log(
        `OpsFlow API running at http://localhost:${port}`,
    )
})