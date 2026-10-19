import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { unlink } from 'node:fs/promises'

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