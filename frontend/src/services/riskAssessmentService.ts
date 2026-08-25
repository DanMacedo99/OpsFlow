import type {
    RiskHistoryEntry,
} from '../types/riskAssessment'

type RiskHistoryApiResponse = {
    data: RiskHistoryEntry[]
}

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
    throw new Error(
        'VITE_API_URL is not configured.',
    )
}

export async function getSupplierRiskHistory(
    supplierId: string,
): Promise<RiskHistoryEntry[]> {
    const response = await fetch(
        `${apiUrl}/suppliers/${encodeURIComponent(
            supplierId,
        )}/assessments/risk-history`,
    )

    if (!response.ok) {
        throw new Error(
            `Could not load risk history. Status: ${response.status}`,
        )
    }

    const responseBody =
        (await response.json()) as RiskHistoryApiResponse

    return responseBody.data
}