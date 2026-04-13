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
    'taxes',
    {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      tax_name: {
        type: 'varchar(100)',
        notNull: true,
      },
      tax_code: {
        type: 'varchar(50)',
        notNull: true,
        unique: true,
      },
      tax_type: {
        type: 'varchar(50)',
        notNull: true,
      },
      percentage: {
        type: 'numeric(5, 2)',
        notNull: true,
      },
      description: {
        type: 'text',
      },
      is_active: {
        type: 'boolean',
        notNull: true,
        default: true,
      },
      is_default: {
        type: 'boolean',
        notNull: true,
        default: false,
      },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    },
    { ifNotExists: true }
  );

  // Trigger for updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_taxes_updated_at') THEN
        CREATE TRIGGER update_taxes_updated_at
        BEFORE UPDATE ON taxes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('taxes', { ifExists: true });
};
