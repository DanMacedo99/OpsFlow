import { useRef, useState } from 'react'
import {
    analyzeSupplierDocument,
    uploadSupplierDocument,
    type DocumentAnalysis,
} from '../../services/documentService'

import './DocumentUpload.css'

type DocumentUploadProps = {
    supplierId: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function DocumentUpload({
    supplierId,
}: DocumentUploadProps) {
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null)

    const [isUploading, setIsUploading] =
        useState(false)

    const [message, setMessage] =
        useState('')

    const [documentId, setDocumentId] =
        useState<string | null>(null)

    const [analysis, setAnalysis] =
        useState<DocumentAnalysis | null>(null)

    const [isAnalyzing, setIsAnalyzing] =
        useState(false)

    const [isReviewed, setIsReviewed] =
        useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleClear() {
        setSelectedFile(null)
        setMessage('')
        setDocumentId(null)
        setAnalysis(null)
        setIsReviewed(false)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    async function handleUpload() {
        if (!selectedFile) {
            return
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setMessage('PDF must be 5 MB or smaller.')
            return
        }

        if (
            selectedFile.type !== 'application/pdf' ||
            !selectedFile.name.toLowerCase().endsWith('.pdf')
        ) {
            setMessage('Please select a valid PDF file.')
            return
        }

        setIsUploading(true)
        setMessage('')

        try {
            const result =
                await uploadSupplierDocument(
                    supplierId,
                    selectedFile,
                )

            setDocumentId(result.documentId)
            setAnalysis(null)

            setMessage(
                'Document uploaded successfully.',
            )
        } catch {
            setMessage('Could not upload document.')
        } finally {
            setIsUploading(false)
        }
    }

    async function handleAnalyze() {
        if (!documentId) {
            return
        }

        try {
            setIsAnalyzing(true)
            setMessage('')

            const result =
                await analyzeSupplierDocument(
                    supplierId,
                    documentId,
                )

            setAnalysis(result)
            setIsReviewed(false)
        } catch {
            setMessage(
                'Could not analyze document.',
            )
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="document-upload">
            <label htmlFor="supplier-document">
                PDF document
            </label>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                    const file =
                        event.target.files?.[0] ?? null

                    setSelectedFile(file)
                    setDocumentId(null)
                    setAnalysis(null)
                    setMessage('')
                }}
                disabled={
                    selectedFile !== null ||
                    isUploading ||
                    isAnalyzing
                }
            />

            <div className="document-upload-actions">
                <button
                    type="button"
                    onClick={() => void handleUpload()}
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload PDF'}
                </button>

                {documentId && (
                    <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing
                            ? 'Analyzing...'
                            : 'Analyze document'}
                    </button>
                )}

                <button
                    type="button"
                    className="clear-button"
                    onClick={handleClear}
                    disabled={!selectedFile || isUploading}
                >
                    Clear
                </button>
            </div>

            {message && (
                <p className="upload-message" role="status">{message}</p>
            )}

            {analysis && (
                <section className="document-analysis">
                    <h3>AI Document Analysis</h3>

                    <div className="analysis-section">
                        <h4>Supplier</h4>
                        <p>{analysis.supplier}</p>
                    </div>

                    <div className="analysis-section">
                        <h4>Overall Status</h4>
                        <p>{analysis.overallStatus}</p>
                    </div>

                    <div className="analysis-section">
                        <h4>Summary</h4>
                        <p>{analysis.summary}</p>
                    </div>

                    <div className="analysis-section">
                        <h4>Risks</h4>

                        {analysis.risks.length === 0 ? (
                            <p>No risks identified.</p>
                        ) : (
                            <ul>
                                {analysis.risks.map(
                                    (risk, index) => (
                                        <li key={index}>
                                            <strong>
                                                {risk.title}
                                            </strong>

                                            <p
                                                className={`risk-severity risk-severity-${risk.severity}`}
                                            >
                                                {risk.severity}
                                            </p>

                                            <p>
                                                {
                                                    risk.description
                                                }
                                            </p>

                                            <p>
                                                Pages:{' '}
                                                {risk.pages.join(
                                                    ', ',
                                                )}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="analysis-section">
                        <h4>Inconsistencies</h4>

                        {analysis.inconsistencies.length ===
                            0 ? (
                            <p>
                                No inconsistencies
                                identified.
                            </p>
                        ) : (
                            <ul>
                                {analysis.inconsistencies.map(
                                    (item, index) => (
                                        <li key={index}>
                                            <p>
                                                {
                                                    item.description
                                                }
                                            </p>

                                            <p>
                                                Pages:{' '}
                                                {item.pages.join(
                                                    ', ',
                                                )}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="analysis-section">
                        <h4>Missing Evidence</h4>

                        {analysis.missingEvidence.length ===
                            0 ? (
                            <p>
                                No missing evidence
                                identified.
                            </p>
                        ) : (
                            <ul>
                                {analysis.missingEvidence.map(
                                    (item, index) => (
                                        <li key={index}>
                                            <p>
                                                {
                                                    item.description
                                                }
                                            </p>

                                            <p>
                                                Pages:{' '}
                                                {item.pages.join(
                                                    ', ',
                                                )}
                                            </p>
                                        </li>
                                    ),
                                )}
                            </ul>

                        )}

                        <div className="analysis-review">
                            <h4>Human Review</h4>

                            <p>
                                This analysis was generated by AI and is
                                advisory only. It does not change the
                                supplier's official status, risk score,
                                or assessment.
                            </p>

                            <label className="analysis-review-control">
                                <input
                                    type="checkbox"
                                    checked={isReviewed}
                                    onChange={(event) =>
                                        setIsReviewed(
                                            event.target.checked,
                                        )
                                    }
                                />

                                <span>
                                    I have reviewed this AI analysis.
                                </span>
                            </label>

                            {isReviewed && (
                                <p className="analysis-reviewed-message">
                                    Human review completed.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}