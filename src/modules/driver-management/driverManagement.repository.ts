
import { query } from '../../shared/database';

export class DriverManagementRepository {
  static async findAll(limit: number = 50, offset: number = 0) {
    const result = await query(
      `SELECT d.*, 
       (SELECT json_build_object(
           'plan_name', rp.plan_name,
           'expiry_date', ds.expiry_date,
           'status', ds.status,
           'billing_cycle', ds.billing_cycle,
           'start_date', ds.start_date
         )
         FROM driver_subscriptions ds
         JOIN recharge_plans rp ON ds.plan_id = rp.id
         WHERE ds.driver_id = d.id AND ds.status = 'active'
         LIMIT 1
       ) as active_subscription
       FROM drivers d
       WHERE d.is_deleted = false 
       ORDER BY d.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await query('SELECT COUNT(*) FROM drivers WHERE is_deleted = false');
    
    return {
      drivers: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async findById(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(id);
    
    const result = await query(
      `SELECT * FROM drivers WHERE ${isUuid ? 'id' : 'vdrive_id'} = $1 AND is_deleted = false`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async search(searchTerm: string, limit: number = 50, offset: number = 0) {
    const ilikeTerm = `%${searchTerm}%`;
    const result = await query(
      `SELECT d.*, 
       (SELECT json_build_object(
           'plan_name', rp.plan_name,
           'expiry_date', ds.expiry_date,
           'status', ds.status,
           'billing_cycle', ds.billing_cycle,
           'start_date', ds.start_date
         )
         FROM driver_subscriptions ds
         JOIN recharge_plans rp ON ds.plan_id = rp.id
         WHERE ds.driver_id = d.id AND ds.status = 'active'
         LIMIT 1
       ) as active_subscription
       FROM drivers d
       WHERE (d.first_name ILIKE $1 OR d.last_name ILIKE $1 OR d.phone_number ILIKE $1 OR d.email ILIKE $1 OR d.vdrive_id ILIKE $1 OR d.id::text ILIKE $1)
       AND d.is_deleted = false 
       ORDER BY d.created_at DESC LIMIT $2 OFFSET $3`,
      [ilikeTerm, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM drivers 
       WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR phone_number ILIKE $1 OR email ILIKE $1 OR vdrive_id ILIKE $1 OR id::text ILIKE $1)
       AND is_deleted = false`,
      [ilikeTerm]
    );

    return {
      drivers: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  static async updateStatus(id: string, status: string) {
    await query(
      'UPDATE drivers SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
  }

  static async verifyDriver(id: string, kycStatus: string) {
    await query(
      'UPDATE drivers SET kyc_status = $1, updated_at = NOW() WHERE id = $2',
      [kycStatus, id]
    );
  }
}
