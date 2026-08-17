import type { RiskLevel } from '../../types/supplier'
import './SupplierFilters.css'

export type SupplierRiskFilter = 'all' | RiskLevel

type SupplierFiltersProps = {
    searchTerm: string
    riskFilter: SupplierRiskFilter
    onSearchChange: (value: string) => void
    onRiskFilterChange: (value: SupplierRiskFilter) => void
    onClear: () => void
}

function SupplierFilters({
    searchTerm,
    riskFilter,
    onSearchChange,
    onRiskFilterChange,
    onClear,
}: SupplierFiltersProps) {
    const hasActiveFilters =
        searchTerm.length > 0 || riskFilter !== 'all'

    return (
        <div className="supplier-filters" role="search">
            <label>
                <span>Search suppliers</span>
                <input
                    type="search"
                    value={searchTerm}
                    placeholder="Name, ID, category or country"
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>

            <label>
                <span>Risk level</span>
                <select
                    value={riskFilter}
                    onChange={(event) =>
                        onRiskFilterChange(
                            event.target.value as SupplierRiskFilter,
                        )
                    }
                >
                    <option value="all">All risk levels</option>
                    <option value="unassessed">Unassessed</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </label>

            {hasActiveFilters && (
                <button type="button" onClick={onClear}>
                    Clear filters
                </button>
            )}
        </div>
    )
}

export default SupplierFilters