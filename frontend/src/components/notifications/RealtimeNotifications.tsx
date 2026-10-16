import {
    useEffect,
    useState,
} from 'react'

import { socket } from '../../realtime/socket'

import type {
    RiskAssessment,
} from '../../types/riskAssessment'

import './RealtimeNotifications.css'

type Notification = {
    id: number
    message: string
}

function RealtimeNotifications() {
    const [
        notification,
        setNotification,
    ] = useState<Notification | null>(null)

    useEffect(() => {
        function showNotification(
            message: string,
        ) {
            setNotification({
                id: Date.now(),
                message,
            })
        }

        function handleAssessmentCreated(
            assessment: RiskAssessment,
        ) {
            showNotification(
                `New ${assessment.riskLevel} risk assessment created.`,
            )
        }

        function handleAssessmentUpdated(
            assessment: RiskAssessment,
        ) {
            if (
                assessment.decision ===
                'approved'
            ) {
                showNotification(
                    'Risk assessment approved.',
                )

                return
            }

            if (
                assessment.decision ===
                'rejected'
            ) {
                showNotification(
                    'Risk assessment rejected.',
                )

                return
            }

            showNotification(
                'Risk assessment updated.',
            )
        }

        socket.on(
            'assessment:created',
            handleAssessmentCreated,
        )

        socket.on(
            'assessment:updated',
            handleAssessmentUpdated,
        )

        return () => {
            socket.off(
                'assessment:created',
                handleAssessmentCreated,
            )

            socket.off(
                'assessment:updated',
                handleAssessmentUpdated,
            )
        }
    }, [])

    useEffect(() => {
        if (!notification) {
            return
        }

        const timeoutId =
            window.setTimeout(() => {
                setNotification(null)
            }, 4000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [notification])

    if (!notification) {
        return null
    }

    return (
        <div
            key={notification.id}
            className="realtime-notification"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            {notification.message}
        </div>
    )
}

export default RealtimeNotifications