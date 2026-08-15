import type { Supplier } from '../../types/supplier'
import './SupplierTable.css'

type SupplierTableProps = {
    suppliers: Supplier[]
    onSelectSupplier: (supplier: Supplier) => void
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

function SupplierTable({ suppliers, onSelectSupplier }: SupplierTableProps) {

    if (suppliers.length === 0) {
        return (
            <div className="supplier-empty-state">
                <h3>No suppliers found</h3>
                <p>Try changing the search term or risk filter.</p>
            </div>
        )
    }

    return (
        <div className="supplier-table-container">
            <table
                className="supplier-table"
                aria-label="Supplier risk and compliance overview"
            >
                <thead>
                    <tr>
                        <th scope="col">Supplier</th>
                        <th scope="col">Category</th>
                        <th scope="col">Country</th>
                        <th scope="col">Risk</th>
                        <th scope="col">Assessment</th>
                        <th scope="col">Compliance</th>
                        <th scope="col">Last assessment</th>
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
    )
}

export default SupplierTable