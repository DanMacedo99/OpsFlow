import { getGeminiClient } from '../../ai/gemini.client.js'
import { AppError } from '../../errors/AppError.js'
import { aiConfig } from '../../ai/ai.config.js'

import {
    documentAnalysisSchema,
    type DocumentAnalysis,
} from './document.analysis.schema.js'

export async function analyzeDocumentContext(
    documentContext: string,
): Promise<DocumentAnalysis> {
    if (!documentContext.trim()) {
        throw new AppError(
            400,
            'DOCUMENT_TEXT_EMPTY',
            'The document does not contain text to analyse.',
        )
    }

    const client = getGeminiClient()

    const response =
        await client.models.generateContent({
            model: aiConfig.model,

            contents: `
You are analysing a supplier compliance document.

Use only information explicitly supported by the document.

Provide:
- the supplier name;
- the overall assessment status;
- a concise summary of the document;
- identified compliance risks;
- inconsistencies or conflicting information;
- missing evidence or information.

For every risk, inconsistency, and missing evidence item,
provide the page numbers where the supporting information appears.

If no inconsistencies are identified, return an empty array.

DOCUMENT:

${documentContext}
`,

            config: {
                responseMimeType:
                    'application/json',

                responseJsonSchema: {
                    type: 'object',

                    properties: {
                        supplier: {
                            type: 'string',
                        },

                        overallStatus: {
                            type: 'string',
                        },

                        summary: {
                            type: 'string',
                        },

                        risks: {
                            type: 'array',

                            items: {
                                type: 'object',

                                properties: {
                                    title: {
                                        type: 'string',
                                    },

                                    severity: {
                                        type: 'string',
                                        enum: [
                                            'low',
                                            'medium',
                                            'high',
                                            'critical',
                                            'unknown',
                                        ],
                                    },

                                    description: {
                                        type: 'string',
                                    },

                                    pages: {
                                        type: 'array',
                                        items: {
                                            type: 'integer',
                                        },
                                    },
                                },

                                required: [
                                    'title',
                                    'severity',
                                    'description',
                                    'pages',
                                ],
                            },
                        },

                        inconsistencies: {
                            type: 'array',

                            items: {
                                type: 'object',

                                properties: {
                                    description: {
                                        type: 'string',
                                    },

                                    pages: {
                                        type: 'array',
                                        items: {
                                            type: 'integer',
                                        },
                                    },
                                },

                                required: [
                                    'description',
                                    'pages',
                                ],
                            },
                        },

                        missingEvidence: {
                            type: 'array',

                            items: {
                                type: 'object',

                                properties: {
                                    description: {
                                        type: 'string',
                                    },

                                    pages: {
                                        type: 'array',
                                        items: {
                                            type: 'integer',
                                        },
                                    },
                                },

                                required: [
                                    'description',
                                    'pages',
                                ],
                            },
                        },
                    },

                    required: [
                        'supplier',
                        'overallStatus',
                        'summary',
                        'risks',
                        'inconsistencies',
                        'missingEvidence',
                    ],
                },
            },
        })

    if (!response.text) {
        throw new AppError(
            502,
            'AI_EMPTY_RESPONSE',
            'AI returned an empty response.',
        )
    }

    let parsedJson: unknown

    try {
        parsedJson = JSON.parse(response.text)
    } catch {
        throw new AppError(
            502,
            'AI_INVALID_RESPONSE',
            'AI returned invalid JSON.',
        )
    }

    const result =
        documentAnalysisSchema.safeParse(
            parsedJson,
        )

    if (!result.success) {
        throw new AppError(
            502,
            'AI_INVALID_RESPONSE',
            'AI returned an invalid analysis.',
        )
    }

    return result.data
}

