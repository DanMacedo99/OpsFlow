import {
    useEffect,
} from 'react'

import {
    useAuth,
} from './useAuth'

import {
    socket,
} from '../realtime/socket'

export function useRealtimeConnection(): void {
    const {
        status,
    } = useAuth()

    useEffect(() => {
        if (status !== 'authenticated') {
            if (socket.connected) {
                socket.disconnect()
            }

            return
        }

        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [status])
}