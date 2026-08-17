import { useEffect, useState } from 'react'
import { mockSuppliers } from '../data/suppliers'
import MetricCard from '../components/dashboard/MetricCard'
import PageHeader from '../components/layout/PageHeader'
import SupplierDetailsPanel from '../components/dashboard/SupplierDetailsPanel'
import SupplierTable from '../components/dashboard/SupplierTable'
import SupplierForm from '../components/dashboard/SupplierForm'
import './DashboardPage.css'
import SupplierFilters, {
    type SupplierRiskFilter,
} from '../components/dashboard/SupplierFilters'
import type {
    RiskLevel,
    SortDirection,
    Supplier,
    SupplierFormData,
    SupplierSortKey,
} from '../types/supplier'
import FeedbackBanner, {
    type FeedbackVariant,
} from '../components/common/FeedbackBanner'

const riskOrder: Record<RiskLevel, number> = {
    unassessed: 0,
    low: 1,
    medium: 2,
    high: 3,
}

type FeedbackState = {
    message: string
    variant: FeedbackVariant
}

function compareSuppliers(
    firstSupplier: Supplier,
    secondSupplier: Supplier,
    sortKey: SupplierSortKey,
) {
    switch (sortKey) {
        case 'name':
            return firstSupplier.name.localeCompare(secondSupplier.name)

        case 'riskLevel':
            return (
                riskOrder[firstSupplier.riskLevel] -
                riskOrder[secondSupplier.riskLevel]
            )

        case 'complianceScore':
            return (
                firstSupplier.complianceScore -
                secondSupplier.complianceScore
            )

        case 'lastAssessmentDate':
            return (firstSupplier.lastAssessmentDate ?? '').localeCompare(
                secondSupplier.lastAssessmentDate ?? '',
            )
    }
}

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
    const [supplierBeingEdited, setSupplierBeingEdited] = useState<Supplier | null>(null)
    const [riskFilter, setRiskFilter] =
        useState<SupplierRiskFilter>('all')
    const [sortKey, setSortKey] =
        useState<SupplierSortKey>('name')
    const [sortDirection, setSortDirection] =
        useState<SortDirection>('asc')

    const [feedback, setFeedback] =
        useState<FeedbackState | null>(null)

    useEffect(() => {
        if (!feedback) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setFeedback(null)
        }, 4000)

        return () => window.clearTimeout(timeoutId)
    }, [feedback])

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

    const sortedSuppliers = [...filteredSuppliers].sort(
        (firstSupplier, secondSupplier) => {
            if (sortKey === 'riskLevel') {
                const firstIsUnassessed =
                    firstSupplier.riskLevel === 'unassessed'

                const secondIsUnassessed =
                    secondSupplier.riskLevel === 'unassessed'

                if (firstIsUnassessed && !secondIsUnassessed) {
                    return 1
                }

                if (!firstIsUnassessed && secondIsUnassessed) {
                    return -1
                }
            }

            if (sortKey === 'lastAssessmentDate') {
                const firstHasNoDate =
                    firstSupplier.lastAssessmentDate === null

                const secondHasNoDate =
                    secondSupplier.lastAssessmentDate === null

                if (firstHasNoDate && !secondHasNoDate) {
                    return 1
                }

                if (!firstHasNoDate && secondHasNoDate) {
                    return -1
                }
            }

            const comparison = compareSuppliers(
                firstSupplier,
                secondSupplier,
                sortKey,
            )

            return sortDirection === 'asc'
                ? comparison
                : -comparison
        },
    )

    function handleSort(selectedSortKey: SupplierSortKey) {
        if (selectedSortKey === sortKey) {
            setSortDirection((currentDirection) =>
                currentDirection === 'asc' ? 'desc' : 'asc',
            )

            return
        }

        setSortKey(selectedSortKey)

        setSortDirection(
            selectedSortKey === 'name' ? 'asc' : 'desc',
        )
    }

    function handleUpdateSupplier(input: SupplierFormData) {
        if (!supplierBeingEdited) {
            return
        }

        const updatedSupplier: Supplier = {
            ...supplierBeingEdited,
            ...input,
        }

        setSuppliers((currentSuppliers) =>
            currentSuppliers.map((supplier) =>
                supplier.id === updatedSupplier.id
                    ? updatedSupplier
                    : supplier,
            ),
        )

        setSelectedSupplier(updatedSupplier)
        setSupplierBeingEdited(null)
        setFeedback({
            variant: 'success',
            message: `${updatedSupplier.name} was updated successfully.`,
        })
    }

    function handleDeleteSupplier(supplierId: string) {
        const supplierToDelete = suppliers.find(
            (supplier) => supplier.id === supplierId,
        )

        setSuppliers((currentSuppliers) =>
            currentSuppliers.filter(
                (supplier) => supplier.id !== supplierId,
            ),
        )

        setSelectedSupplier(null)
        setSupplierBeingEdited(null)

        setFeedback({
            variant: 'success',
            message: supplierToDelete
                ? `${supplierToDelete.name} was deleted successfully.`
                : 'Supplier was deleted successfully.',
        })

    }

    function handleAddSupplier(input: SupplierFormData) {
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

        setFeedback({
            variant: 'success',
            message: `${newSupplier.name} was added successfully.`,
        })
    }


    return (
        <>
            <PageHeader
                eyebrow="Supplier Risk Management"
                title="Dashboard"
                actionLabel="Add supplier"
                onAction={() => {
                    setSupplierBeingEdited(null)
                    setIsAddSupplierOpen(true)
                }}
            />

            {feedback && (
                <FeedbackBanner
                    message={feedback.message}
                    variant={feedback.variant}
                    onDismiss={() => setFeedback(null)}
                />
            )}
            {isAddSupplierOpen && (
                <SupplierForm
                    title="Add supplier"
                    description="Enter the supplier information to create a new record."
                    submitLabel="Save supplier"
                    onSubmit={handleAddSupplier}
                    onCancel={() => setIsAddSupplierOpen(false)}
                />
            )}

            {supplierBeingEdited && (
                <SupplierForm
                    key={supplierBeingEdited.id}
                    title="Edit supplier"
                    description="Update the supplier information."
                    submitLabel="Save changes"
                    initialValues={{
                        name: supplierBeingEdited.name,
                        category: supplierBeingEdited.category,
                        country: supplierBeingEdited.country,
                    }}
                    onSubmit={handleUpdateSupplier}
                    onCancel={() => setSupplierBeingEdited(null)}
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
                    suppliers={sortedSuppliers}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onSelectSupplier={(supplier) => setSelectedSupplier(supplier)}
                />

                {selectedSupplier && (
                    <SupplierDetailsPanel
                        key={selectedSupplier.id}
                        supplier={selectedSupplier}
                        onClose={() => {
                            setSelectedSupplier(null)
                            setSupplierBeingEdited(null)
                        }}
                        onEdit={() => {
                            setIsAddSupplierOpen(false)
                            setSupplierBeingEdited(selectedSupplier)
                        }}
                        onDelete={handleDeleteSupplier}
                    />
                )}
            </section>
        </>
    )
}

export default DashboardPage