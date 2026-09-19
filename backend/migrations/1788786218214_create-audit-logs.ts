import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable('audit_logs', {
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

        actor_user_id: {
            type: 'uuid',
            references: 'users',
            onDelete: 'SET NULL',
        },

        action: {
            type: 'varchar(100)',
            notNull: true,
        },

        entity_type: {
            type: 'varchar(100)',
            notNull: true,
        },

        entity_id: {
            type: 'varchar(200)',
            notNull: true,
        },

        metadata: {
            type: 'jsonb',
            notNull: true,
            default: pgm.func(`'{}'::jsonb`),
        },

        created_at: {
            type: 'timestamp with time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })

    pgm.createIndex(
        'audit_logs',
        ['organization_id', 'created_at'],
        {
            name: 'audit_logs_organization_created_at_idx',
        },
    )

    pgm.createIndex(
        'audit_logs',
        ['entity_type', 'entity_id'],
        {
            name: 'audit_logs_entity_idx',
        },
    )

    pgm.createIndex(
        'audit_logs',
        'actor_user_id',
        {
            name: 'audit_logs_actor_user_idx',
        },
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('audit_logs')
}