import { query } from '../../shared/database';
import { ExtraKmCheckpoint } from './pricingFareRules.model';

export const ExtraKmCheckpointsRepository = {
  /**
   * Get all checkpoints for a pricing fare rule, sorted by sort_order
   */
  async getByPricingFareRuleId(ruleId: string): Promise<ExtraKmCheckpoint[]> {
    const result = await query(
      'SELECT id, pricing_fare_rule_id, multiplier, sort_order FROM extra_km_checkpoints WHERE pricing_fare_rule_id = $1 ORDER BY sort_order ASC',
      [ruleId]
    );
    return result.rows;
  },

  /**
   * Bulk insert checkpoints for a pricing fare rule
   */
  async bulkCreate(
    checkpoints: Array<{
      pricing_fare_rule_id: string;
      multiplier: number;
      sort_order: number;
    }>
  ): Promise<ExtraKmCheckpoint[]> {
    if (checkpoints.length === 0) return [];

    const values: any[] = [];
    const placeholders = checkpoints.map((c, i) => {
      const base = i * 3;
      values.push(c.pricing_fare_rule_id, c.multiplier, c.sort_order);
      return `($${base + 1}, $${base + 2}, $${base + 3})`;
    });

    const result = await query(
      `INSERT INTO extra_km_checkpoints (pricing_fare_rule_id, multiplier, sort_order)
       VALUES ${placeholders.join(', ')}
       RETURNING id, pricing_fare_rule_id, multiplier, sort_order`,
      values
    );
    return result.rows;
  },

  /**
   * Delete all checkpoints for a pricing fare rule
   */
  async deleteByPricingFareRuleId(ruleId: string): Promise<void> {
    await query('DELETE FROM extra_km_checkpoints WHERE pricing_fare_rule_id = $1', [ruleId]);
  },
};
