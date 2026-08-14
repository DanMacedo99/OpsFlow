type PageHeaderProps = {
    eyebrow: string
    title: string
    actionLabel: string
}

function PageHeader({
    eyebrow,
    title,
    actionLabel,
}: PageHeaderProps) {
    return (
        <header className="page-header">
            <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1>{title}</h1>
            </div>

            <button type="button" className="primary-button">
                {actionLabel}
            </button>
        </header>
    )
}

export default PageHeader