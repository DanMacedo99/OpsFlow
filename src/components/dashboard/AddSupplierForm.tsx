import { useState, type FormEvent } from 'react'
import type { NewSupplierInput } from '../../types/supplier'
import './AddSupplierForm.css'

type AddSupplierFormProps = {
    onSubmit: (supplier: NewSupplierInput) => void
    onCancel: () => void
}

function AddSupplierForm({
    onSubmit,
    onCancel,
}: AddSupplierFormProps) {
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [country, setCountry] = useState('')

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        onSubmit({
            name: name.trim(),
            category: category.trim(),
            country: country.trim(),
        })
    }

    return (
        <section
            className="content-panel add-supplier-panel"
            aria-labelledby="add-supplier-heading"
        >
            <div className="add-supplier-panel-header">
                <div>
                    <h2 id="add-supplier-heading">Add supplier</h2>
                    <p>Enter the supplier information to create a new record.</p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>

            <form className="supplier-form" onSubmit={handleSubmit}>
                <div className="supplier-form-grid">
                    <label>
                        Supplier name
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Category
                        <input
                            type="text"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Country
                        <input
                            type="text"
                            value={country}
                            onChange={(event) => setCountry(event.target.value)}
                            required
                        />
                    </label>
                </div>

                <button type="submit" className="primary-button">
                    Save supplier
                </button>
            </form>
        </section>
    )
}

export default AddSupplierForm