import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.addColumn(
        'supplier_documents',
        {
            content_hash: {
                type: 'varchar(64)',
            },
        },
    )

    pgm.createIndex(
        'supplier_documents',
        [
            'organization_id',
            'supplier_id',
            'content_hash',
        ],
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropColumn(
        'supplier_documents',
        'content_hash',
    )
}