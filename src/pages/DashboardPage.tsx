import MetricCard from '../components/dashboard/MetricCard'
import PageHeader from '../components/layout/PageHeader'
import './DashboardPage.css'

const metrics = [
    {
        label: 'Total suppliers',
        value: '128',
        description: 'Active supplier records',
    },
    {
        label: 'High risk',
        value: '9',
        description: 'Require immediate review',
    },
    {
        label: 'Pending assessments',
        value: '17',
        description: 'Awaiting evaluation',
    },
    {
        label: 'Compliance rate',
        value: '92%',
        description: 'Documents up to date',
    },
]

function DashboardPage() {
    return (
        <>
            <PageHeader
                eyebrow="Supplier Risk Management"
                title="Dashboard"
                actionLabel="Add supplier"
            />

            <section aria-labelledby="overview-heading">
                <h2 id="overview-heading">Risk overview</h2>

                <div className="metrics-grid">
                    {metrics.map((metric) => (
                        <MetricCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            description={metric.description}
                        />
                    ))}
                </div>
            </section>
        </>
    )
}

export default DashboardPage