import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
} from 'react'
import type { SupplierFormData } from '../../types/supplier'
import './SupplierForm.css'

type SupplierFormProps = {
    title: string
    description: string
    submitLabel: string
    initialValues?: SupplierFormData
    onSubmit: (supplier: SupplierFormData) => void
    onCancel: () => void
}

function SupplierForm({
    title,
    description,
    submitLabel,
    initialValues,
    onSubmit,
    onCancel,
}: SupplierFormProps) {
    const [name, setName] = useState(initialValues?.name ?? '')
    const [category, setCategory] = useState(
        initialValues?.category ?? '',
    )
    const [country, setCountry] = useState(
        initialValues?.country ?? '',
    )
    const nameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        nameInputRef.current?.focus()
    }, [])

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
            aria-labelledby="supplier-form-heading"
        >
            <div className="add-supplier-panel-header">
                <div>
                    <h2 id="supplier-form-heading">{title}</h2>
                    <p>{description}</p>
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
                            ref={nameInputRef}
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
                    {submitLabel}
                </button>
            </form>
        </section>
    )
}

export default SupplierForm