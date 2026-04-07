/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.addColumns('recharge_plans', {
    daily_price: { type: 'numeric(10,2)', default: 0 },
    weekly_price: { type: 'numeric(10,2)', default: 0 },
    monthly_price: { type: 'numeric(10,2)', default: 0 },
    features: { type: 'jsonb', default: '{}' },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropColumns('recharge_plans', ['daily_price', 'weekly_price', 'monthly_price', 'features']);
};
