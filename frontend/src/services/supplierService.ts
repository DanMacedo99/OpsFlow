import type {
    Supplier,
    SupplierFormData,
} from '../types/supplier'

type SuppliersApiResponse = {
    data: Supplier[]
}

type SupplierApiResponse = {
    data: Supplier
}


const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured.')
}


export async function getSuppliers(): Promise<
    Supplier[]
> {
    const response = await fetch(
        `${apiUrl}/suppliers`,
    )

    if (!response.ok) {
        throw new Error(
            `Could not load suppliers. Status: ${response.status}`,
        )
    }

    const responseBody =
        (await response.json()) as SuppliersApiResponse

    return responseBody.data
}

export async function createSupplier(
    input: SupplierFormData,
): Promise<Supplier> {
    const response = await fetch(
        `${apiUrl}/suppliers`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        },
    )

    if (!response.ok) {
        throw new Error(
            `Could not create supplier. Status: ${response.status}`,
        )
    }

    const responseBody =
        (await response.json()) as SupplierApiResponse

    return responseBody.data
}

export async function updateSupplier(
    currentSupplier: Supplier,
    input: SupplierFormData,
): Promise<Supplier> {
    const response = await fetch(
        `${apiUrl}/suppliers/${encodeURIComponent(
            currentSupplier.id,
        )}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: input.name,
                category: input.category,
                country: input.country,
                riskLevel: currentSupplier.riskLevel,
                assessmentStatus:
                    currentSupplier.assessmentStatus,
                complianceScore:
                    currentSupplier.complianceScore,
                lastAssessmentDate:
                    currentSupplier.lastAssessmentDate,
            }),
        },
    )

    if (!response.ok) {
        throw new Error(
            `Could not update supplier. Status: ${response.status}`,
        )
    }

    const responseBody =
        (await response.json()) as SupplierApiResponse

    return responseBody.data
}

export async function deleteSupplier(
    supplierId: string,
): Promise<void> {
    const response = await fetch(
        `${apiUrl}/suppliers/${encodeURIComponent(
            supplierId,
        )}`,
        {
            method: 'DELETE',
        },
    )

    if (!response.ok) {
        throw new Error(
            `Could not delete supplier. Status: ${response.status}`,
        )
    }
}