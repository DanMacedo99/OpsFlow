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
    pgm.createTable('risk_assessment_responses', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        assessment_id: {
            type: 'uuid',
            notNull: true,
            references: 'risk_assessments',
            onDelete: 'CASCADE',
        },
        criterion_key: {
            type: 'varchar(50)',
            notNull: true,
            check: `criterion_key IN (
                'information-security',
                'data-protection',
                'regulatory-compliance',
                'operational-resilience',
                'financial-stability'
            )`,
        },
        score: {
            type: 'smallint',
            notNull: true,
            check: 'score BETWEEN 0 AND 100',
        },
        criterion_weight: {
            type: 'smallint',
            notNull: true,
            check: 'criterion_weight BETWEEN 1 AND 100',
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

    pgm.addConstraint(
        'risk_assessment_responses',
        'risk_assessment_responses_assessment_criterion_unique',
        {
            unique: [
                'assessment_id',
                'criterion_key',
            ],
        },
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('risk_assessment_responses')
}