/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable(
    'pricing_combinations',
    {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
      tier: { type: 'integer', notNull: true },
      duration: { type: 'numeric(10,2)', notNull: true },
      distance: { type: 'numeric(10,2)', notNull: true },
      type: { type: 'varchar(20)', notNull: true }, // 'Base' or 'Extra KM'
      price: { type: 'numeric(10,2)', notNull: true },
      per_km_rate: { type: 'numeric(10,2)', notNull: true },
      created_at: {
        type: 'timestamp with time zone',
        default: pgm.func('CURRENT_TIMESTAMP'),
        notNull: true,
      },
      updated_at: {
        type: 'timestamp with time zone',
        default: pgm.func('CURRENT_TIMESTAMP'),
        notNull: true,
      },
    },
    { ifNotExists: true }
  );

  // Add indexes for common queries
  pgm.createIndex('pricing_combinations', ['tier', 'distance'], { ifNotExists: true });
};

export const down = (pgm) => {
  pgm.dropTable('pricing_combinations', { ifExists: true });
};
