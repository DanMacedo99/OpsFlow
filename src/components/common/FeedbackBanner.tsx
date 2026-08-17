import './FeedbackBanner.css'

export type FeedbackVariant = 'success' | 'error' | 'info'

type FeedbackBannerProps = {
    message: string
    variant: FeedbackVariant
    onDismiss: () => void
}

function FeedbackBanner({
    message,
    variant,
    onDismiss,
}: FeedbackBannerProps) {
    return (
        <div
            className={`feedback-banner feedback-${variant}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <span>{message}</span>

            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss notification"
            >
                Dismiss
            </button>
        </div>
    )
}

export default FeedbackBanner