import { useState } from 'react'
import type { Supplier } from '../types/supplier'
import { mockSuppliers } from '../data/suppliers'
import type { NewSupplierInput } from '../types/supplier'
import MetricCard from '../components/dashboard/MetricCard'
import PageHeader from '../components/layout/PageHeader'
import SupplierDetailsPanel from '../components/dashboard/SupplierDetailsPanel'
import SupplierTable from '../components/dashboard/SupplierTable'
import AddSupplierForm from '../components/dashboard/AddSupplierForm'
import './DashboardPage.css'
import SupplierFilters, {
    type SupplierRiskFilter,
} from '../components/dashboard/SupplierFilters'


function createNextSupplierId(suppliers: Supplier[]) {
    const highestId = suppliers.reduce((highest, supplier) => {
        const numericId = Number(supplier.id.replace('SUP-', ''))

        if (Number.isNaN(numericId)) {
            return highest
        }

        return Math.max(highest, numericId)
    }, 0)

    return `SUP-${String(highestId + 1).padStart(3, '0')}`
}



function DashboardPage() {
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
    const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
    const [searchTerm, setSearchTerm] = useState('')
    const [riskFilter, setRiskFilter] =
        useState<SupplierRiskFilter>('all')

    const highRiskSuppliers = suppliers.filter(
        (supplier) => supplier.riskLevel === 'high',
    ).length

    const pendingAssessments = suppliers.filter(
        (supplier) => supplier.assessmentStatus === 'pending',
    ).length

    const assessedSuppliers = suppliers.filter(
        (supplier) => supplier.lastAssessmentDate !== null,
    )

    const averageCompliance =
        assessedSuppliers.length === 0
            ? 0
            : Math.round(
                assessedSuppliers.reduce(
                    (total, supplier) =>
                        total + supplier.complianceScore,
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

    const normalizedSearch = searchTerm.trim().toLowerCase()

    const filteredSuppliers = suppliers.filter((supplier) => {
        const searchableValues = [
            supplier.id,
            supplier.name,
            supplier.category,
            supplier.country,
        ]

        const matchesSearch = searchableValues.some((value) =>
            value.toLowerCase().includes(normalizedSearch),
        )

        const matchesRisk =
            riskFilter === 'all' ||
            supplier.riskLevel === riskFilter

        return matchesSearch && matchesRisk
    })

    function handleDeleteSupplier(supplierId: string) {
        setSuppliers((currentSuppliers) =>
            currentSuppliers.filter(
                (supplier) => supplier.id !== supplierId,
            ),
        )

        setSelectedSupplier(null)
    }

    function handleAddSupplier(input: NewSupplierInput) {
        const newSupplier: Supplier = {
            id: createNextSupplierId(suppliers),
            ...input,
            riskLevel: 'unassessed',
            assessmentStatus: 'pending',
            complianceScore: 0,
            lastAssessmentDate: null,
        }

        setSuppliers((currentSuppliers) => [
            newSupplier,
            ...currentSuppliers,
        ])

        setSelectedSupplier(newSupplier)
        setIsAddSupplierOpen(false)
    }


    return (
        <>
            <PageHeader
                eyebrow="Supplier Risk Management"
                title="Dashboard"
                actionLabel="Add supplier"
                onAction={() => setIsAddSupplierOpen(true)}
            />
            {isAddSupplierOpen && (
                <AddSupplierForm
                    onSubmit={handleAddSupplier}
                    onCancel={() => setIsAddSupplierOpen(false)}
                />
            )}

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

                <SupplierFilters
                    searchTerm={searchTerm}
                    riskFilter={riskFilter}
                    onSearchChange={setSearchTerm}
                    onRiskFilterChange={setRiskFilter}
                    onClear={() => {
                        setSearchTerm('')
                        setRiskFilter('all')
                    }}
                />

                <SupplierTable
                    suppliers={filteredSuppliers}
                    onSelectSupplier={(supplier) => setSelectedSupplier(supplier)}
                />

                {selectedSupplier && (
                    <SupplierDetailsPanel
                        supplier={selectedSupplier}
                        onClose={() => setSelectedSupplier(null)}
                        onDelete={handleDeleteSupplier}
                    />
                )}
            </section>
        </>
    )
}

export default DashboardPage