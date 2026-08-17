import type { Ref } from 'react'

type PageHeaderProps = {
    eyebrow: string
    title: string
    actionLabel: string
    actionButtonRef?: Ref<HTMLButtonElement>
    onAction: () => void
}
function PageHeader({
    eyebrow,
    title,
    actionLabel,
    actionButtonRef,
    onAction,
}: PageHeaderProps) {
    return (
        <header className="page-header">
            <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1>{title}</h1>
            </div>

            <button
                ref={actionButtonRef}
                type="button"
                className="primary-button"
                onClick={onAction}
            >
                {actionLabel}
            </button>
        </header>
    )
}

export default PageHeader