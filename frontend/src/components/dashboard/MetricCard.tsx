import './MetricCard.css'

type MetricCardProps = {
    label: string
    value: string
    description: string
}

function MetricCard({
    label,
    value,
    description,
}: MetricCardProps) {
    return (
        <article className="metric-card">
            <h3>{label}</h3>
            <strong className="metric-value">{value}</strong>
            <p>{description}</p>
        </article>
    )
}

export default MetricCard