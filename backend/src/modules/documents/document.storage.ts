import { randomUUID } from 'node:crypto'
import {
    mkdir,
    readFile,
    unlink,
    writeFile,
} from 'node:fs/promises'
import path from 'node:path'


const storageDirectory = path.resolve(
    'storage',
    'documents',
)

export async function saveDocument(
    buffer: Buffer,
): Promise<string> {
    const storageKey = `${randomUUID()}.pdf`

    await mkdir(storageDirectory, {
        recursive: true,
    })

    await writeFile(
        path.join(storageDirectory, storageKey),
        buffer,
        { flag: 'wx' },
    )

    return storageKey
}

export async function deleteDocument(
    storageKey: string,
): Promise<void> {
    await unlink(
        path.join(storageDirectory, storageKey),
    )
}

export function readDocument(
    storageKey: string,
): Promise<Buffer> {
    return readFile(
        path.join(
            storageDirectory,
            storageKey,
        ),
    )
}