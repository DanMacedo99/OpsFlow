
import type {
    SortDirection,
    Supplier,
    SupplierSortKey,
} from '../../types/supplier'
import './SupplierTable.css'

type SupplierTableProps = {
    suppliers: Supplier[]
    sortKey: SupplierSortKey
    sortDirection: SortDirection
    onSelectSupplier: (supplier: Supplier) => void
    onSort: (sortKey: SupplierSortKey) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
})

function formatDate(date: string | null) {
    if (!date) {
        return 'Not assessed'
    }

    return dateFormatter.format(new Date(`${date}T00:00:00`))
}

function formatLabel(value: string) {
    return value.replaceAll('-', ' ')
}

function SupplierTable({
    suppliers,
    sortKey,
    sortDirection,
    onSelectSupplier,
    onSort,
}: SupplierTableProps) {

    if (suppliers.length === 0) {
        return (
            <div className="supplier-empty-state">
                <h3>No suppliers found</h3>
                <p>Try changing the search term or risk filter.</p>
            </div>
        )
    }

    function getAriaSort(column: SupplierSortKey) {
        if (sortKey !== column) {
            return 'none'
        }

        return sortDirection === 'asc'
            ? 'ascending'
            : 'descending'
    }

    function getSortIndicator(column: SupplierSortKey) {
        if (sortKey !== column) {
            return null
        }

        return sortDirection === 'asc' ? '↑' : '↓'
    }

    return (
        <div className="supplier-table-container">
            <p
                id="supplier-table-scroll-instructions"
                className="visually-hidden"
            >
                Scroll horizontally to view all supplier information.
            </p>

            <div
                className="supplier-table-scroll"
                role="region"
                aria-label="Supplier records"
                aria-describedby="supplier-table-scroll-instructions"
                tabIndex={0}
            >
                <table
                    className="supplier-table"
                    aria-label="Supplier risk and compliance overview"
                >
                    <thead>
                        <tr>
                            <th scope="col" aria-sort={getAriaSort('name')}>
                                <button
                                    type="button"
                                    className="table-sort-button"
                                    onClick={() => onSort('name')}
                                >
                                    Supplier
                                    <span className="sort-indicator" aria-hidden="true">
                                        {getSortIndicator('name')}
                                    </span>
                                </button>
                            </th>
                            <th scope="col">Category</th>
                            <th scope="col">Country</th>
                            <th scope="col" aria-sort={getAriaSort('riskLevel')}>
                                <button
                                    type="button"
                                    className="table-sort-button"
                                    onClick={() => onSort('riskLevel')}
                                >
                                    Risk
                                    <span className="sort-indicator" aria-hidden="true">
                                        {getSortIndicator('riskLevel')}
                                    </span>
                                </button>
                            </th>
                            <th scope="col">Assessment</th>
                            <th
                                scope="col"
                                aria-sort={getAriaSort('complianceScore')}
                            >
                                <button
                                    type="button"
                                    className="table-sort-button"
                                    onClick={() => onSort('complianceScore')}
                                >
                                    Compliance
                                    <span className="sort-indicator" aria-hidden="true">
                                        {getSortIndicator('complianceScore')}
                                    </span>
                                </button>
                            </th>
                            <th
                                scope="col"
                                aria-sort={getAriaSort('lastAssessmentDate')}
                            >
                                <button
                                    type="button"
                                    className="table-sort-button"
                                    onClick={() => onSort('lastAssessmentDate')}
                                >
                                    Last assessment
                                    <span className="sort-indicator" aria-hidden="true">
                                        {getSortIndicator('lastAssessmentDate')}
                                    </span>
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id}>
                                <td>
                                    <div className="supplier-name">
                                        <div className="supplier-name">
                                            <button
                                                type="button"
                                                className="supplier-button"
                                                onClick={() => onSelectSupplier(supplier)}
                                            >
                                                {supplier.name}
                                            </button>

                                            <span>{supplier.id}</span>
                                        </div>
                                        <span>{supplier.id}</span>
                                    </div>
                                </td>
                                <td>{supplier.category}</td>
                                <td>{supplier.country}</td>
                                <td>
                                    <span className={`risk-badge risk-${supplier.riskLevel}`}>
                                        {supplier.riskLevel}
                                    </span>
                                </td>
                                <td className="assessment-status">
                                    {formatLabel(supplier.assessmentStatus)}
                                </td>
                                <td>{supplier.complianceScore}%</td>
                                <td>{formatDate(supplier.lastAssessmentDate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SupplierTable