import PageHeader from '../components/layout/PageHeader'

function DashboardPage() {
    return (
        <>
            <PageHeader
                eyebrow="Supplier Risk Management"
                title="Dashboard"
                actionLabel="Add supplier"
            />

            <section className="content-panel" aria-labelledby="overview-heading">
                <h2 id="overview-heading">Risk overview</h2>
                <p>Supplier metrics will appear here.</p>
            </section>
        </>
    )
}

export default DashboardPage