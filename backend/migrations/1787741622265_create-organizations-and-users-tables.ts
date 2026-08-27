import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable('organizations', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        name: {
            type: 'varchar(150)',
            notNull: true,
        },
        slug: {
            type: 'varchar(100)',
            notNull: true,
            unique: true,
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

    pgm.createTable('users', {
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
        name: {
            type: 'varchar(150)',
            notNull: true,
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
        },
        password_hash: {
            type: 'text',
            notNull: true,
        },
        role: {
            type: 'varchar(30)',
            notNull: true,
            default: 'viewer',
        },
        is_active: {
            type: 'boolean',
            notNull: true,
            default: true,
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
        'users',
        'users_role_check',
        {
            check: `
                role IN (
                    'admin',
                    'risk_manager',
                    'reviewer',
                    'viewer'
                )
            `,
        },
    )

    pgm.createIndex(
        'users',
        'organization_id',
    )

    pgm.sql(`
        CREATE UNIQUE INDEX users_email_unique_index
        ON users (LOWER(email));
    `)
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('users')
    pgm.dropTable('organizations')
}