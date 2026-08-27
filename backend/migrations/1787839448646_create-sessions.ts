import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.createTable('sessions', {
        sid: {
            type: 'varchar',
            primaryKey: true,
            notNull: true,
        },
        sess: {
            type: 'json',
            notNull: true,
        },
        expire: {
            type: 'timestamp(6)',
            notNull: true,
        },
    })

    pgm.createIndex(
        'sessions',
        'expire',
        {
            name: 'sessions_expire_index',
        },
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropTable('sessions')
}