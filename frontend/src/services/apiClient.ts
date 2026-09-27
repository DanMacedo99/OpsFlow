const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured.')
}

export async function apiFetch(
    path: string,
    options: RequestInit = {},
): Promise<Response> {


    const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        credentials: 'include',
    })

    if (response.status === 401) {

        window.dispatchEvent(
            new Event('auth:unauthorized'),
        )
    }

    return response
}

export class ApiError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}