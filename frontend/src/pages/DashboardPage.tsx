import {
    useEffect,
    useState,
} from 'react'

import MetricCard from '../components/dashboard/MetricCard'
import PageHeader from '../components/layout/PageHeader'
import { useNavigate } from 'react-router-dom'

import { getSuppliers } from '../services/supplierService'

import type { Supplier } from '../types/supplier'

import './DashboardPage.css'

function DashboardPage() {
    const [suppliers, setSuppliers] =
        useState<Supplier[]>([])

    const [isLoadingSuppliers, setIsLoadingSuppliers] =
        useState(true)

    const [supplierLoadError, setSupplierLoadError] =
        useState<string | null>(null)

    const [reloadKey, setReloadKey] =
        useState(0)

    const navigate = useNavigate()

    useEffect(() => {
        let isActive = true

        async function loadSuppliers() {
            setIsLoadingSuppliers(true)
            setSupplierLoadError(null)

            try {
                const loadedSuppliers =
                    await getSuppliers()

                if (isActive) {
                    setSuppliers(loadedSuppliers)
                }
            } catch {
                if (isActive) {
                    setSupplierLoadError(
                        'We could not load the dashboard data. Please try again.',
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoadingSuppliers(false)
                }
            }
        }

        void loadSuppliers()

        return () => {
            isActive = false
        }
    }, [reloadKey])

    const highRiskSuppliers =
        suppliers.filter(
            (supplier) =>
                supplier.riskLevel === 'high',
        ).length

    const pendingAssessments =
        suppliers.filter(
            (supplier) =>
                supplier.assessmentStatus === 'pending',
        ).length

    const assessedSuppliers =
        suppliers.filter(
            (supplier) =>
                supplier.lastAssessmentDate !== null,
        )

    const averageCompliance =
        assessedSuppliers.length === 0
            ? 0
            : Math.round(
                assessedSuppliers.reduce(
                    (total, supplier) =>
                        total +
                        supplier.complianceScore,
                    0,
                ) / assessedSuppliers.length,
            )

    const metrics = [
        {
            label: 'Total suppliers',
            value: String(suppliers.length),
            description: 'Supplier records',
        },
        {
            label: 'High risk',
            value: String(highRiskSuppliers),
            description: 'Require immediate review',
        },
        {
            label: 'Pending assessments',
            value: String(pendingAssessments),
            description: 'Awaiting evaluation',
        },
        {
            label: 'Average compliance',
            value: `${averageCompliance}%`,
            description: 'Across assessed suppliers',
        },
    ]

    return (
        <>
           <PageHeader
                eyebrow="Supplier Risk Management"
                title="Dashboard"
                actionLabel="View suppliers"
                onAction={() => {
                    navigate('/suppliers')
                }}
            />

            {isLoadingSuppliers ? (
                <p role="status">
                    Loading dashboard...
                </p>
            ) : supplierLoadError ? (
                <div role="alert">
                    <p>{supplierLoadError}</p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                            setReloadKey(
                                (currentKey) =>
                                    currentKey + 1,
                            )
                        }}
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <section aria-labelledby="overview-heading">
                    <h2 id="overview-heading">
                        Risk overview
                    </h2>

                    <div className="metrics-grid">
                        {metrics.map((metric) => (
                            <MetricCard
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                description={
                                    metric.description
                                }
                            />
                        ))}
                    </div>
                </section>
            )}
        </>
    )
}

export default DashboardPage