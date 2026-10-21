import { PDFParse } from 'pdf-parse'

export type ExtractedPage = {
    pageNumber: number
    text: string
}

export async function extractPdfText(
    buffer: Buffer,
): Promise<ExtractedPage[]> {
    const parser = new PDFParse({
        data: new Uint8Array(buffer),
    })

    try {
        const result = await parser.getText()
        
        return result.pages.map((page) => ({
            pageNumber: page.num,
            text: page.text,
        }))

    } finally {
        await parser.destroy()
    }
}