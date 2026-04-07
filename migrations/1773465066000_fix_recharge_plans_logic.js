/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  // 1. Rename 'standard' to 'elite'
  pgm.sql(`UPDATE recharge_plans SET plan_name = 'elite' WHERE plan_name = 'standard'`);

  // 2. Update features for 'basic' (Only Local)
  pgm.sql(`
    UPDATE recharge_plans 
    SET features = jsonb_build_object(
      'rides_limit', (features->>'rides_limit')::int,
      'priority_support', false,
      'allowed_ride_types', jsonb_build_array('LOCAL')
    )
    WHERE plan_name = 'basic'
  `);

  // 3. Update features for 'elite' (Local, One-Way, Outstation)
  pgm.sql(`
    UPDATE recharge_plans 
    SET features = jsonb_build_object(
      'rides_limit', (features->>'rides_limit')::int,
      'priority_support', true,
      'allowed_ride_types', jsonb_build_array('LOCAL', 'ONE-WAY', 'OUT-STATION')
    )
    WHERE plan_name = 'elite'
  `);

  // 4. Update features for 'premium' (All: Local, One-Way, Outstation, Round-Trip)
  pgm.sql(`
    UPDATE recharge_plans 
    SET features = jsonb_build_object(
      'rides_limit', (features->>'rides_limit')::int,
      'priority_support', true,
      'allowed_ride_types', jsonb_build_array('LOCAL', 'ONE-WAY', 'OUT-STATION', 'ROUND-TRIP', 'SCHEDULE')
    )
    WHERE plan_name = 'premium'
  `);
};

export const down = (pgm) => {
  // Revert 'elite' to 'standard'
  pgm.sql(`UPDATE recharge_plans SET plan_name = 'standard' WHERE plan_name = 'elite'`);
};
