import type {
    RiskHistoryEntry,
} from '../types/riskAssessment'

import { apiFetch } from './apiClient'

type RiskHistoryApiResponse = {
    data: RiskHistoryEntry[]
}


export async function getSupplierRiskHistory(
    supplierId: string,
): Promise<RiskHistoryEntry[]> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(supplierId)}/assessments/risk-history`,
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