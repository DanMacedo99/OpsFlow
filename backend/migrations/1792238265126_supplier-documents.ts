import type { MigrationBuilder } from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable('supplier_documents', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },

        organization_id: {
            type: 'uuid',
            notNull: true,
            references: 'organizations',
            onDelete: 'CASCADE',
        },

        supplier_id: {
            type: 'varchar(20)',
            notNull: true,
            references: 'suppliers',
            onDelete: 'CASCADE',
        },

        original_name: {
            type: 'varchar(255)',
            notNull: true,
        },

        storage_key: {
            type: 'text',
            notNull: true,
            unique: true,
        },

        mime_type: {
            type: 'varchar(100)',
            notNull: true,
        },

        size_bytes: {
            type: 'integer',
            notNull: true,
        },

        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })

    pgm.createIndex(
        'supplier_documents',
        ['organization_id', 'supplier_id'],
        {
            name: 'supplier_documents_org_supplier_idx',
        },
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('supplier_documents')
}