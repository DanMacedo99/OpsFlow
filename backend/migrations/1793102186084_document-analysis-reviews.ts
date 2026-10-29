import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable(
        'supplier_document_analysis_reviews',
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

            analysis_id: {
                type: 'uuid',
                notNull: true,
                references:
                    'supplier_document_analyses',
                onDelete: 'CASCADE',
                unique: true,
            },

            review_status: {
                type: 'varchar(30)',
                notNull: true,
            },

            reviewed_by: {
                type: 'uuid',
                notNull: true,
                references: 'users',
            },

            review_comment: {
                type: 'text',
            },

            reviewed_at: {
                type: 'timestamptz',
                notNull: true,
                default:
                    pgm.func(
                        'current_timestamp',
                    ),
            },
        },
    )

    pgm.addConstraint(
        'supplier_document_analysis_reviews',
        'document_analysis_review_status_check',
        {
            check: `
                review_status IN (
                    'accepted',
                    'rejected',
                    'needs_follow_up'
                )
            `,
        },
    )

    pgm.createIndex(
        'supplier_document_analysis_reviews',
        [
            'organization_id',
            'supplier_id',
            'analysis_id',
        ],
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable(
        'supplier_document_analysis_reviews',
    )
}