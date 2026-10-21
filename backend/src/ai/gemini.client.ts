import { GoogleGenAI } from '@google/genai'

import { env } from '../config/env.js'
import { AppError } from '../errors/AppError.js'

let geminiClient: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
    if (!env.GEMINI_API_KEY) {
        throw new AppError(
            503,
            'AI_NOT_CONFIGURED',
            'AI service is not configured.',
        )
    }

    if (!geminiClient) {
        geminiClient = new GoogleGenAI({
            apiKey: env.GEMINI_API_KEY,
        })
    }

    return geminiClient
}