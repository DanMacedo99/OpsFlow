import {
    useEffect,
    useState,
} from 'react'

import {
    getDocumentAnalyses,
    getSupplierDocuments,
    type StoredDocumentAnalysis,
    type SupplierDocument,
} from '../../services/documentService'

import './DocumentList.css'

type DocumentListProps = {
    supplierId: string
}

export function DocumentList({
    supplierId,
}: DocumentListProps) {
    const [documents, setDocuments] =
        useState<SupplierDocument[]>([])

    const [isLoading, setIsLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    const [
        selectedDocumentId,
        setSelectedDocumentId,
    ] = useState<string | null>(null)

    const [analyses, setAnalyses] =
        useState<StoredDocumentAnalysis[]>([])

    const [isLoadingAnalyses, setIsLoadingAnalyses] =
        useState(false)

    const [analysisError, setAnalysisError] =
        useState<string | null>(null)

    useEffect(() => {
        let isActive = true

        async function loadDocuments() {
            try {
                setIsLoading(true)
                setError(null)

                const result =
                    await getSupplierDocuments(
                        supplierId,
                    )

                if (isActive) {
                    setDocuments(result)
                    setSelectedDocumentId(null)
                }
            } catch {
                if (isActive) {
                    setError(
                        'Could not load documents.',
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        void loadDocuments()

        return () => {
            isActive = false
        }
    }, [supplierId])

    useEffect(() => {
        if (!selectedDocumentId) {
            return
        }

        let isActive = true

        async function loadAnalyses() {
            try {
                setIsLoadingAnalyses(true)
                setAnalysisError(null)

                const result =
                    await getDocumentAnalyses(
                        supplierId,
                        selectedDocumentId!,
                    )

                if (isActive) {
                    setAnalyses(result)
                }
            } catch {
                if (isActive) {
                    setAnalysisError(
                        'Could not load document analyses.',
                    )
                }
            } finally {
                if (isActive) {
                    setIsLoadingAnalyses(false)
                }
            }
        }

        void loadAnalyses()

        return () => {
            isActive = false
        }
    }, [
        supplierId,
        selectedDocumentId,
    ])

    const selectedDocument =
        documents.find(
            (document) =>
                document.id ===
                selectedDocumentId,
        ) ?? null

    if (isLoading) {
        return <p>Loading documents...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    if (documents.length === 0) {
        return (
            <p>
                No documents uploaded for this
                supplier.
            </p>
        )
    }

    return (
        <div className="document-library">
            <div className="document-list">
                {documents.map((document) => {
                    const isSelected =
                        document.id ===
                        selectedDocumentId

                    return (
                        <button
                            key={document.id}
                            type="button"
                            className={
                                isSelected
                                    ? 'document-list-item document-list-item-selected'
                                    : 'document-list-item'
                            }
                            onClick={() => {
                                setSelectedDocumentId(
                                    document.id,
                                )
                                setAnalyses([])
                                setAnalysisError(null)
                            }}
                        >
                            <div className="document-list-main">
                                <strong>
                                    {
                                        document.originalName
                                    }
                                </strong>

                                <span>
                                    PDF document
                                </span>
                            </div>

                            <div className="document-list-meta">
                                <span>
                                    {(
                                        document.sizeBytes /
                                        1024
                                    ).toFixed(1)}{' '}
                                    KB
                                </span>

                                <span>
                                    {new Date(
                                        document.createdAt,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {selectedDocument && (
                <section className="document-details">
                    <h4>Document Details</h4>

                    <dl>
                        <div>
                            <dt>File name</dt>
                            <dd>
                                {
                                    selectedDocument.originalName
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>Type</dt>
                            <dd>
                                {
                                    selectedDocument.mimeType
                                }
                            </dd>
                        </div>

                        <div>
                            <dt>Size</dt>
                            <dd>
                                {(
                                    selectedDocument.sizeBytes /
                                    1024
                                ).toFixed(1)}{' '}
                                KB
                            </dd>
                        </div>

                        <div>
                            <dt>Uploaded</dt>
                            <dd>
                                {new Date(
                                    selectedDocument.createdAt,
                                ).toLocaleString()}
                            </dd>
                        </div>

                        <div>
                            <dt>Document ID</dt>
                            <dd>
                                {
                                    selectedDocument.id
                                }
                            </dd>
                        </div>
                    </dl>
                    <div className="document-analysis-history">
                        <h4>AI Analysis History</h4>

                        {isLoadingAnalyses && (
                            <p>Loading analyses...</p>
                        )}

                        {analysisError && (
                            <p>{analysisError}</p>
                        )}

                        {!isLoadingAnalyses &&
                            !analysisError &&
                            analyses.length === 0 && (
                                <p>
                                    No AI analyses have been generated
                                    for this document yet.
                                </p>
                            )}

                        {analyses.map((storedAnalysis, index) => {
                            const analysis =
                                storedAnalysis.analysis

                            return (
                                <details
                                    key={storedAnalysis.id}
                                    className="stored-analysis"
                                    open={index === 0}
                                >
                                    <summary>
                                        Analysis from{' '}
                                        {new Date(
                                            storedAnalysis.createdAt,
                                        ).toLocaleString()}
                                    </summary>

                                    <div className="stored-analysis-meta">
                                        <span>
                                            Provider:{' '}
                                            {storedAnalysis.provider}
                                        </span>

                                        <span>
                                            Model:{' '}
                                            {storedAnalysis.model}
                                        </span>
                                    </div>

                                    <h5>Supplier</h5>
                                    <p>{analysis.supplier}</p>

                                    <h5>Overall Status</h5>
                                    <p>
                                        {analysis.overallStatus}
                                    </p>

                                    <h5>Summary</h5>
                                    <p>{analysis.summary}</p>

                                    <h5>Risks</h5>

                                    {analysis.risks.length === 0 ? (
                                        <p>No risks identified.</p>
                                    ) : (
                                        <ul>
                                            {analysis.risks.map(
                                                (risk, riskIndex) => (
                                                    <li
                                                        key={
                                                            riskIndex
                                                        }
                                                    >
                                                        <strong>
                                                            {risk.title}
                                                        </strong>

                                                        <p>
                                                            Severity:{' '}
                                                            {
                                                                risk.severity
                                                            }
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

                                    <h5>Inconsistencies</h5>

                                    {analysis.inconsistencies.length ===
                                        0 ? (
                                        <p>
                                            No inconsistencies
                                            identified.
                                        </p>
                                    ) : (
                                        <ul>
                                            {analysis.inconsistencies.map(
                                                (item, itemIndex) => (
                                                    <li
                                                        key={
                                                            itemIndex
                                                        }
                                                    >
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

                                    <h5>Missing Evidence</h5>

                                    {analysis.missingEvidence.length ===
                                        0 ? (
                                        <p>
                                            No missing evidence
                                            identified.
                                        </p>
                                    ) : (
                                        <ul>
                                            {analysis.missingEvidence.map(
                                                (item, itemIndex) => (
                                                    <li
                                                        key={
                                                            itemIndex
                                                        }
                                                    >
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
                                </details>
                            )
                        })}
                    </div>

                </section>
            )}
        </div>
    )
}