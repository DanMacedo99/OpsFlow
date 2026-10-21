import type {
    ExtractedPage,
} from './document.parser.js'

export function buildDocumentContext(
    pages: ExtractedPage[],
): string {
    const contextPages: string[] = []

    for (const page of pages) {
        const text =
            prepareDocumentText(page.text)

        if (!text) {
            continue
        }

        contextPages.push(
            `[Page ${page.pageNumber}]\n${text}`,
        )
    }

    return contextPages.join('\n\n')
}

export function prepareDocumentText(
    text: string,
): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}
