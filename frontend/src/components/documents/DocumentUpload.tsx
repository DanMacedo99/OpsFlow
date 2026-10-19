import { useRef, useState } from 'react'
import { uploadSupplierDocument } from '../../services/documentService'
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

    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleClear() {
        setSelectedFile(null)
        setMessage('')

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
            await uploadSupplierDocument(
                supplierId,
                selectedFile,
            )

            setMessage('Document uploaded successfully.')
            setSelectedFile(null)
        } catch {
            setMessage('Could not upload document.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="document-upload">
            <label htmlFor="supplier-document">
                PDF document
            </label>

            <input
                ref={fileInputRef}
                id="supplier-document"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                    setSelectedFile(
                        event.target.files?.[0] ?? null,
                    )
                }}
            />

            <div className="document-upload-actions">
                <button
                    type="button"
                    onClick={() => void handleUpload()}
                    disabled={!selectedFile || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload PDF'}
                </button>

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
        </div>
    )
}