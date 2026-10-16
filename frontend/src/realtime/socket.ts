import { io } from 'socket.io-client'

const socketUrl =
    import.meta.env.VITE_API_URL

export const socket = io(
    socketUrl,
    {
        autoConnect: false,
        withCredentials: true,

        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
    },
)