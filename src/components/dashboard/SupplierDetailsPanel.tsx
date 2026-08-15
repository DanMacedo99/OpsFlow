import type { Supplier } from '../../types/supplier'
import { useState } from 'react'
import './SupplierDetailsPanel.css'

type SupplierDetailsPanelProps = {
    supplier: Supplier
    onClose: () => void
    onDelete: (supplierId: string) => void
}

function formatLabel(value: string) {
    return value.replaceAll('-', ' ')
}

function SupplierDetailsPanel({
    supplier,
    onClose,
    onDelete,
}: SupplierDetailsPanelProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
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

                <div className="supplier-details-actions">
                    <button type="button" onClick={onClose}>
                        Close
                    </button>

                    <button
                        type="button"
                        className="delete-supplier-button"
                        onClick={() => setIsConfirmingDelete(true)}
                    >
                        Delete supplier
                    </button>
                </div>
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
            {isConfirmingDelete && (
                <div className="delete-confirmation" role="alert">
                    <div>
                        <strong>Delete this supplier?</strong>
                        <p>This action removes the supplier from the current session.</p>
                    </div>

                    <div className="delete-confirmation-actions">
                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="confirm-delete-button"
                            onClick={() => onDelete(supplier.id)}
                        >
                            Confirm delete
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}

export default SupplierDetailsPanel