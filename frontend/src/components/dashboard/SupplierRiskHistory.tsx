import type {
    RiskHistoryEntry,
} from '../../types/riskAssessment'
import './SupplierRiskHistory.css'
type SupplierRiskHistoryProps = {
    history: RiskHistoryEntry[]
    isLoading: boolean
    error: string | null
}

function formatRiskLabel(value: string) {
    return value.replaceAll('-', ' ')
}

function formatAssessmentDate(value: string) {
    return new Intl.DateTimeFormat('en-IE', {
        dateStyle: 'medium',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`))
}

function SupplierRiskHistory({
    history,
    isLoading,
    error,
}: SupplierRiskHistoryProps) {
    if (isLoading) {
        return (
            <section aria-labelledby="risk-history-heading" className="risk-history">
                <h3 id="risk-history-heading">
                    Risk history
                </h3>

                <p role="status" className="risk-history-message">
                    Loading risk history...
                </p>
            </section>
        )
    }

    if (error) {
        return (
            <section aria-labelledby="risk-history-heading">
                <h3 id="risk-history-heading">
                    Risk history
                </h3>

                <p role="alert" className="risk-history-message risk-history-error">
                    {error}
                </p>
            </section>
        )
    }

    return (
        <section aria-labelledby="risk-history-heading">
            <h3 id="risk-history-heading">
                Risk history
            </h3>
            {history.length === 0 ? (
                <p className="risk-history-message">
                    No risk changes recorded.
                </p>
            ) : (
                <ol className="risk-history-list">
                    {history.map((entry) => (
                        <li
                            key={entry.assessmentId}
                            className="risk-history-item"
                        >
                            <p className="risk-history-change">
                                {formatRiskLabel(
                                    entry.previousRiskLevel,
                                )}
                                {' → '}
                                {formatRiskLabel(
                                    entry.currentRiskLevel,
                                )}
                            </p>

                            <p className="risk-history-detail">
                                Risk score:{' '}
                                {entry.previousRiskScore ??
                                    'not scored'}
                                {' → '}
                                {entry.currentRiskScore}
                            </p>

                            <p className="risk-history-detail">
                                Compliance:{' '}
                                {entry.complianceScore}%
                            </p>

                            <p className="risk-history-detail">
                                Decision:{' '}
                                {formatRiskLabel(entry.decision)}
                            </p>

                            <p className="risk-history-date">
                                {formatAssessmentDate(
                                    entry.assessmentDate,
                                )}
                            </p>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}

export default SupplierRiskHistory