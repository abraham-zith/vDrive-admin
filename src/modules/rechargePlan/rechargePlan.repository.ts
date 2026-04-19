
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
       (plan_name, description, validity_days, daily_price, weekly_price, monthly_price, features, is_active, tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        data.planName,
        data.description,
        data.validityDays,
        data.dailyPrice ?? 0,
        data.weeklyPrice ?? 0,
        data.monthlyPrice ?? 0,
        JSON.stringify(data.features ?? []),
        data.isActive ?? true,
        data.tag || null,
      ]
    );
    return res.rows[0];
  },


  async update(id: number, data: any) {
    const res = await query(
      `UPDATE recharge_plans
       SET plan_name = $1,
           description = $2,
           validity_days = $3,
           daily_price = $4,
           weekly_price = $5,
           monthly_price = $6,
           features = $7,
           is_active = $8,
           tag = $9
       WHERE id = $10 RETURNING *`,
      [
        data.planName,
        data.description,
        data.validityDays,
        data.dailyPrice,
        data.weeklyPrice,
        data.monthlyPrice,
        JSON.stringify(data.features || []),
        data.isActive,
        data.tag || null,
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

  async getActiveSubscriptions() {
    const res = await query(
      `SELECT 
        ds.id, 
        d.full_name as driver_name, 
        d.phone_number as driver_phone, 
        rp.plan_name, 
        ds.billing_cycle, 
        ds.start_date, 
        ds.expiry_date
       FROM driver_subscriptions ds
       JOIN drivers d ON ds.driver_id = d.id
       JOIN recharge_plans rp ON ds.plan_id = rp.id
       WHERE ds.status = 'active'
       ORDER BY ds.start_date DESC`
    );
    return res.rows;
  },

  async delete(id: number) {
    await query(
      `DELETE FROM recharge_plans WHERE id=$1`,
      [id]
    );
  },

  async recordHistory(data: {
    planId: number;
    adminId: string;
    action: string;
    previousData: any;
    newData: any;
  }) {
    await query(
      `INSERT INTO recharge_plan_history (plan_id, admin_id, action, previous_data, new_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        data.planId,
        data.adminId,
        data.action,
        data.previousData ? JSON.stringify(data.previousData) : null,
        data.newData ? JSON.stringify(data.newData) : null,
      ]
    );
  },

  async getHistory(planId: number) {
    const res = await query(
      `SELECT h.*, a.name as admin_name 
       FROM recharge_plan_history h
       LEFT JOIN admin_users a ON h.admin_id = a.id
       WHERE h.plan_id = $1
       ORDER BY h.created_at DESC`,
      [planId]
    );
    return res.rows;
  },
};
