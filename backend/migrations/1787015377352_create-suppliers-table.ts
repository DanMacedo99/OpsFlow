import type {
    ColumnDefinitions,
    MigrationBuilder,
} from 'node-pg-migrate'

export const shorthands:
    ColumnDefinitions | undefined = undefined

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable('suppliers', {
        id: {
            type: 'varchar(20)',
            primaryKey: true,
        },
        name: {
            type: 'varchar(150)',
            notNull: true,
        },
        category: {
            type: 'varchar(100)',
            notNull: true,
        },
        country: {
            type: 'varchar(100)',
            notNull: true,
        },
        risk_level: {
            type: 'varchar(20)',
            notNull: true,
            default: 'unassessed',
            check:
                `"risk_level" IN ('unassessed', 'low', 'medium', 'high')`,
        },
        assessment_status: {
            type: 'varchar(30)',
            notNull: true,
            default: 'pending',
            check:
                `"assessment_status" IN ('approved', 'pending', 'review-required')`,
        },
        compliance_score: {
            type: 'smallint',
            notNull: true,
            default: 0,
            check:
                '"compliance_score" BETWEEN 0 AND 100',
        },
        last_assessment_date: {
            type: 'date',
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
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('suppliers')
}