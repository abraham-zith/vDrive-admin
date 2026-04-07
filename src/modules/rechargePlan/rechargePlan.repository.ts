
import { query } from '../../shared/database';

export const RechargePlanRepository = {

 
  async getPlans(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const plans = await query(
      `SELECT * FROM recharge_plans 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const totalRes = await query(
      `SELECT COUNT(*) AS total FROM recharge_plans`
    );

    return {
      data: plans.rows,
      total: Number(totalRes.rows[0].total),
    };
  },

  
  async getById(id: number) {
    const res = await query(
      `SELECT * FROM recharge_plans WHERE id=$1`,
      [id]
    );
    return res.rows[0];
  },

 
  async create(data: any) {
    const res = await query(
      `INSERT INTO recharge_plans 
       (plan_name, description, ride_limit, validity_days, daily_price, weekly_price, monthly_price, features, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.planName,
        data.description,
        0, // ride_limit removed
        data.validityDays,
        data.dailyPrice ?? 0,
        data.weeklyPrice ?? 0,
        data.monthlyPrice ?? 0,
        JSON.stringify(data.features ?? []),
        data.isActive ?? true,
      ]
    );
    return res.rows[0];
  },


  async update(id: number, data: any) {
    const res = await query(
      `UPDATE recharge_plans
       SET plan_name=$1, description=$2, ride_limit=$3,
           validity_days=$4, daily_price=$5, weekly_price=$6, monthly_price=$7, features=$8, is_active=$9
       WHERE id=$10 RETURNING *`,
      [
        data.planName,
        data.description,
        0, // ride_limit removed
        data.validityDays,
        data.dailyPrice,
        data.weeklyPrice,
        data.monthlyPrice,
        JSON.stringify(data.features ?? []),
        data.isActive,
        id,
      ]
    );
    return res.rows[0];
  },


  
  async toggle(id: number, status: boolean) {
    const res = await query(
      `UPDATE recharge_plans 
       SET is_active=$1 
       WHERE id=$2 
       RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  },

 
  async delete(id: number) {
    await query(
      `DELETE FROM recharge_plans WHERE id=$1`,
      [id]
    );
  },
};
