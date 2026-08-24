import type {
    ColumnDefinitions,
    MigrationBuilder,
} from 'node-pg-migrate'

export const shorthands:
    | ColumnDefinitions
    | undefined = undefined

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createExtension('pgcrypto', {
        ifNotExists: true,
    })

    pgm.createTable('risk_assessments', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        supplier_id: {
            type: 'varchar(20)',
            notNull: true,
            references: 'suppliers',
            onDelete: 'CASCADE',
        },
        risk_score: {
            type: 'smallint',
            check: 'risk_score BETWEEN 0 AND 100',
        },
        risk_level: {
            type: 'varchar(20)',
            notNull: true,
            default: 'unassessed',
            check: `risk_level IN (
                'unassessed',
                'low',
                'medium',
                'high'
            )`,
        },
        compliance_score: {
            type: 'smallint',
            check: 'compliance_score BETWEEN 0 AND 100',
        },
        decision: {
            type: 'varchar(20)',
            notNull: true,
            default: 'pending',
            check: `decision IN (
                'pending',
                'approved',
                'rejected'
            )`,
        },
        document_status: {
            type: 'varchar(20)',
            notNull: true,
            default: 'missing',
            check: `document_status IN (
                'missing',
                'pending',
                'verified',
                'expired'
            )`,
        },
        assessment_date: {
            type: 'date',
        },
        review_date: {
            type: 'date',
        },
        notes: {
            type: 'text',
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })

    pgm.createIndex(
        'risk_assessments',
        'supplier_id',
    )

    pgm.createIndex(
        'risk_assessments',
        'review_date',
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('risk_assessments')
}