import { getGeminiClient } from '../../ai/gemini.client.js'
import { aiConfig } from '../../ai/ai.config.js'
import { AppError } from '../../errors/AppError.js'

import {
    documentQualificationSchema,
    type DocumentQualification,
} from './document.qualification.schema.js'

export async function qualifyDocumentContext(
    documentContext: string,
    expectedSupplier: string,
): Promise<DocumentQualification> {
    if (!documentContext.trim()) {
        throw new AppError(
            400,
            'DOCUMENT_TEXT_EMPTY',
            'The document does not contain text to qualify.',
        )
    }

    const client = getGeminiClient()

    const response =
        await client.models.generateContent({
            model: aiConfig.model,

            contents: `
You are qualifying a document before supplier compliance analysis.

The supplier expected by the application is:

${expectedSupplier}

Analyse the document and determine:

- which supplier or company the document primarily refers to;
- whether that company matches the expected supplier;
- whether the document is relevant to supplier risk, compliance,
  security, privacy, legal, financial, operational, business continuity,
  certification, insurance, or due diligence assessment;
- the document type;
- a concise reason for your classification.

Supplier matching rules:
- "match": the document clearly refers to the expected supplier.
- "mismatch": the document clearly refers to another supplier/company.
- "uncertain": there is not enough information to determine this reliably.

Relevance rules:
- "relevant": useful evidence for supplier risk or compliance assessment.
- "irrelevant": unrelated to supplier risk/compliance assessment.
- "uncertain": relevance cannot be determined reliably.

Do not assume that every uploaded document is relevant.
Do not perform the compliance risk analysis yet.

DOCUMENT:

${documentContext}
`,

            config: {
                responseMimeType:
                    'application/json',

                responseJsonSchema: {
                    type: 'object',

                    properties: {
                        detectedSupplier: {
                            type: [
                                'string',
                                'null',
                            ],
                        },

                        supplierMatch: {
                            type: 'string',
                            enum: [
                                'match',
                                'mismatch',
                                'uncertain',
                            ],
                        },

                        relevance: {
                            type: 'string',
                            enum: [
                                'relevant',
                                'irrelevant',
                                'uncertain',
                            ],
                        },

                        documentType: {
                            type: 'string',
                        },

                        reason: {
                            type: 'string',
                        },
                    },

                    required: [
                        'detectedSupplier',
                        'supplierMatch',
                        'relevance',
                        'documentType',
                        'reason',
                    ],
                },
            },
        })

    if (!response.text) {
        throw new AppError(
            502,
            'AI_EMPTY_RESPONSE',
            'AI returned an empty qualification response.',
        )
    }

    let parsedJson: unknown

    try {
        parsedJson =
            JSON.parse(response.text)
    } catch {
        throw new AppError(
            502,
            'AI_INVALID_RESPONSE',
            'AI returned invalid qualification JSON.',
        )
    }

    const result =
        documentQualificationSchema.safeParse(
            parsedJson,
        )

    if (!result.success) {
        throw new AppError(
            502,
            'AI_INVALID_RESPONSE',
            'AI returned an invalid document qualification.',
        )
    }

    return result.data
}