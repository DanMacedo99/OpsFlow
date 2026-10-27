import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.alterColumn(
    'supplier_documents',
    'content_hash',
    {
        notNull: true,
    },
)

pgm.addConstraint(
    'supplier_documents',
    'supplier_documents_unique_content',
    {
        unique: [
            'organization_id',
            'supplier_id',
            'content_hash',
        ],
    },
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