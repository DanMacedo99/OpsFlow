import type { Supplier } from '../../types/supplier'
import {
    useEffect,
    useRef,
    useState,
    type Ref,
} from 'react'
import './SupplierDetailsPanel.css'


type SupplierDetailsPanelProps = {
    supplier: Supplier
    editButtonRef?: Ref<HTMLButtonElement>
    onClose: () => void
    onEdit: () => void
    onDelete: (supplierId: string) => void
}

function formatLabel(value: string) {
    return value.replaceAll('-', ' ')
}

function SupplierDetailsPanel({
    supplier,
    editButtonRef,
    onEdit,
    onClose,
    onDelete,
}: SupplierDetailsPanelProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const deleteButtonRef = useRef<HTMLButtonElement>(null)

    const cancelDeleteButtonRef =
        useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (isConfirmingDelete) {
            cancelDeleteButtonRef.current?.focus()
        }
    }, [isConfirmingDelete])

    return (
        <section
            id="supplier-details-panel"
            className="content-panel supplier-details"
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
                        ref={editButtonRef}
                        type="button"
                        onClick={onEdit}
                    >
                        Edit supplier
                    </button>

                    <button
                        ref={deleteButtonRef}
                        type="button"
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
                <div
                    className="delete-confirmation"
                    role="group"
                    aria-labelledby="delete-confirmation-message"
                >
                    <p id="delete-confirmation-message">
                        Are you sure you want to delete {supplier.name}?
                    </p>

                    <div className="delete-confirmation-actions">
                        <button
                            ref={cancelDeleteButtonRef}
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(false)

                                window.requestAnimationFrame(() => {
                                    deleteButtonRef.current?.focus()
                                })
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => onDelete(supplier.id)}
                        >
                            Confirm deletion
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}

export default SupplierDetailsPanel