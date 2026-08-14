import type { Supplier } from '../../types/supplier'
import './SupplierDetailsPanel.css'

type SupplierDetailsPanelProps = {
    supplier: Supplier
    onClose: () => void
}

function formatLabel(value: string) {
    return value.replaceAll('-', ' ')
}

function SupplierDetailsPanel({
    supplier,
    onClose,
}: SupplierDetailsPanelProps) {
    return (
        <section
            className="supplier-details"
            aria-labelledby="supplier-details-heading"
        >
            <header className="supplier-details-header">
                <div>
                    <p>Supplier profile</p>
                    <h2 id="supplier-details-heading">{supplier.name}</h2>
                </div>

                <button type="button" onClick={onClose}>
                    Close
                </button>
            </header>

            <dl className="supplier-details-grid">
                <div>
                    <dt>Supplier ID</dt>
                    <dd>{supplier.id}</dd>
                </div>

                <div>
                    <dt>Category</dt>
                    <dd>{supplier.category}</dd>
                </div>

                <div>
                    <dt>Country</dt>
                    <dd>{supplier.country}</dd>
                </div>

                <div>
                    <dt>Risk level</dt>
                    <dd>{supplier.riskLevel}</dd>
                </div>

                <div>
                    <dt>Assessment</dt>
                    <dd>{formatLabel(supplier.assessmentStatus)}</dd>
                </div>

                <div>
                    <dt>Compliance score</dt>
                    <dd>{supplier.complianceScore}%</dd>
                </div>
            </dl>
        </section>
    )
}

export default SupplierDetailsPanel