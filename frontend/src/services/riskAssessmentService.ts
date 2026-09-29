import type {
    CreateRiskAssessmentInput,
    RiskAssessment,
    RiskHistoryEntry,
    UpdateRiskAssessmentDecisionInput,
    UpdateRiskAssessmentDocumentStatusInput,
} from '../types/riskAssessment'

import {
    ApiError,
    apiFetch,
} from './apiClient'

type RiskAssessmentsApiResponse = {
    data: RiskAssessment[]
}

type RiskAssessmentApiResponse = {
    data: RiskAssessment
}

type RiskHistoryApiResponse = {
    data: RiskHistoryEntry[]
}

type ApiErrorResponse = {
    error?: {
        code?: string
        message?: string
    }
}

async function createApiError(
    response: Response,
    fallbackMessage: string,
): Promise<ApiError> {
    let message = fallbackMessage

    try {
        const body =
            (await response.json()) as ApiErrorResponse

        if (body.error?.message) {
            message = body.error.message
        }
    } catch {
        // Keep fallback message if response is not JSON.
    }

    return new ApiError(
        message,
        response.status,
    )
}

export async function getSupplierRiskAssessments(
    supplierId: string,
): Promise<RiskAssessment[]> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/assessments`,
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not load risk assessments.',
        )
    }

    const responseBody =
        (await response.json()) as RiskAssessmentsApiResponse

    return responseBody.data
}

export async function createSupplierRiskAssessment(
    supplierId: string,
    input: CreateRiskAssessmentInput,
): Promise<RiskAssessment> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/assessments`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not create risk assessment.',
        )
    }

    const responseBody =
        (await response.json()) as RiskAssessmentApiResponse

    return responseBody.data
}

export async function updateRiskAssessmentDecision(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDecisionInput,
): Promise<RiskAssessment> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/assessments/${encodeURIComponent(
            assessmentId,
        )}/decision`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not update assessment decision.',
        )
    }

    const responseBody =
        (await response.json()) as RiskAssessmentApiResponse

    return responseBody.data
}

export async function updateRiskAssessmentDocumentStatus(
    supplierId: string,
    assessmentId: string,
    input: UpdateRiskAssessmentDocumentStatusInput,
): Promise<RiskAssessment> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/assessments/${encodeURIComponent(
            assessmentId,
        )}/document-status`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not update document status.',
        )
    }

    const responseBody =
        (await response.json()) as RiskAssessmentApiResponse

    return responseBody.data
}

export async function getSupplierRiskHistory(
    supplierId: string,
): Promise<RiskHistoryEntry[]> {
    const response = await apiFetch(
        `/suppliers/${encodeURIComponent(
            supplierId,
        )}/assessments/risk-history`,
    )

    if (!response.ok) {
        throw await createApiError(
            response,
            'Could not load risk history.',
        )
    }

    const responseBody =
        (await response.json()) as RiskHistoryApiResponse

    return responseBody.data
}