import type {
    MigrationBuilder,
} from 'node-pg-migrate'

export async function up(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.addColumn('suppliers', {
        organization_id: {
            type: 'uuid',
            references: 'organizations',
            onDelete: 'CASCADE',
        },
    })

    pgm.sql(`
        UPDATE suppliers
        SET organization_id = (
            SELECT id
            FROM organizations
        )
        WHERE organization_id IS NULL
    `)

    pgm.alterColumn(
        'suppliers',
        'organization_id',
        {
            notNull: true,
        },
    )

    pgm.createIndex(
        'suppliers',
        'organization_id',
        {
            name:
                'suppliers_organization_id_index',
        },
    )
}

export async function down(
    pgm: MigrationBuilder,
): Promise<void> {
    pgm.dropIndex(
        'suppliers',
        'organization_id',
        {
            name:
                'suppliers_organization_id_index',
        },
    )

    pgm.dropColumn(
        'suppliers',
        'organization_id',
    )
}