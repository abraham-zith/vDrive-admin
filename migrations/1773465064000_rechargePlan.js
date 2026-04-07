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
  // Create recharge_plan
  pgm.sql(`
    DO $$ 
    BEGIN
      CREATE TYPE recharge_plan_type_enum AS ENUM ('ONE-WAY','ROUND-TRIP','OUT-STATION','SCHEDULE');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  //  Create recharge_plans table
  pgm.createTable(
    'recharge_plans',
    {
      id: {
        type: 'serial',
        primaryKey: true,
      },

      plan_name: {
        type: 'varchar(100)',
        notNull: true,
      },

      description: {
        type: 'text',
      },

      plan_type: {
        type: 'recharge_plan_type_enum',
        notNull: true,
        default: 'ONE-WAY',
      },

      ride_limit: {
        type: 'int',
        notNull: true,
      },

      validity_days: {
        type: 'int',
        notNull: true,
      },

      price: {
        type: 'numeric(10,2)',
        notNull: true,
      },

      is_active: {
        type: 'boolean',
        notNull: true,
        default: true,
      },

      created_at: {
        type: 'timestamp',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    },
    { ifNotExists: true }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  //drop table
  pgm.dropTable('recharge_plans', { ifExists: true });
  pgm.dropType('recharge_plan_type_enum', { ifExists: true });
};
