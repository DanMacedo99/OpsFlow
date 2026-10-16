import type {
    Server as HttpServer,
} from 'node:http'

import type {
    Request,
} from 'express'

import {
    sessionMiddleware,
} from '../config/session.js'

import {
    Server,
} from 'socket.io'

import {
    env,
} from '../config/env.js'

let io: Server | null = null

export function initializeSocketServer(
    httpServer: HttpServer,
): Server {
    io = new Server(httpServer, {
        cors: {
            origin: env.CORS_ORIGIN,
            credentials: true,
        },
    })

    io.engine.use(sessionMiddleware)

    io.use((socket, next) => {
        const request =
            socket.request as Request

        const sessionUser =
            request.session.user

        if (!sessionUser) {
            next(
                new Error(
                    'Authentication required.',
                ),
            )

            return
        }

        socket.data.userId =
            sessionUser.id

        socket.data.organizationId =
            sessionUser.organizationId

        socket.data.role =
            sessionUser.role

        socket.join(
            sessionUser.organizationId,
        )

        next()
    })

    io.on('connection', (socket) => {
        console.log(
            `Socket connected: ${socket.id}`,
        )

        socket.on('disconnect', (reason) => {
            console.log(
                `Socket disconnected: ${socket.id} (${reason})`,
            )
        })
    })

    return io
}

export function getSocketServer(): Server {
    if (!io) {
        throw new Error(
            'Socket.IO server has not been initialized.',
        )
    }

    return io
}