import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable(
        'supplier_document_analyses',
        {
            id: {
                type: 'uuid',
                primaryKey: true,
                default:
                    pgm.func('gen_random_uuid()'),
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

            document_id: {
                type: 'uuid',
                notNull: true,
                references: 'supplier_documents',
                onDelete: 'CASCADE',
            },

            provider: {
                type: 'varchar(50)',
                notNull: true,
            },

            model: {
                type: 'varchar(100)',
                notNull: true,
            },

            analysis: {
                type: 'jsonb',
                notNull: true,
            },

            created_at: {
                type: 'timestamptz',
                notNull: true,
                default:
                    pgm.func('current_timestamp'),
            },
        },
    )

    pgm.createIndex(
        'supplier_document_analyses',
        [
            'organization_id',
            'supplier_id',
            'document_id',
        ],
    )

    pgm.createIndex(
        'supplier_document_analyses',
        [
            'document_id',
            'created_at',
        ],
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable(
        'supplier_document_analyses',
    )
}