
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
      drivers: result.rows.map((row: any) => ({
        ...row,
        payments: {
          total_earnings: parseFloat(row.total_earnings || 0),
        },
      })),
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
      drivers: result.rows.map((row: any) => ({
        ...row,
        payments: {
          total_earnings: parseFloat(row.total_earnings || 0),
        },
      })),
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

  static async updateProfile(id: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let counter = 1;

    const allowedFields = ['first_name', 'last_name', 'email', 'phone_number', 'dob', 'gender', 'role', 'address'];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        if (key === 'address') {
          fields.push(`address = $${counter}`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = $${counter}`);
          values.push(data[key]);
        }
        counter++;
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    const sql = `UPDATE drivers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${counter} RETURNING *`;
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  static async getDashboardStats() {
    const totalResult = await query(
      'SELECT COUNT(*) FROM drivers WHERE is_deleted = false'
    );
    const activeResult = await query(
      "SELECT COUNT(*) FROM drivers WHERE is_deleted = false AND status = 'active'"
    );

    // Today's registrations
    const todayUsersResult = await query(
      "SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE"
    );
    const todayDriversResult = await query(
      "SELECT COUNT(*) FROM drivers WHERE created_at >= CURRENT_DATE AND is_deleted = false"
    );
    const todaySubscriptionsResult = await query(
      "SELECT COUNT(*) FROM driver_subscriptions WHERE created_at >= CURRENT_DATE AND status = 'active'"
    );

    // Dynamic counts: Available (Online & no active trip) vs On Trip (Active trip)
    const onlineResult = await query(
      "SELECT COUNT(*) FROM drivers WHERE is_deleted = false AND (availability->>'online' = 'true' OR availability->>'status' = 'ONLINE')"
    );

    // On trip means ANY ongoing status that assigned a driver
    const onTripResult = await query(
      "SELECT COUNT(DISTINCT driver_id) FROM trips WHERE trip_status IN ('ACCEPTED', 'ARRIVING', 'ARRIVED', 'LIVE', 'DESTINATION_REACHED')"
    );

    // Scheduled Rides
    const totalScheduledResult = await query(
      "SELECT COUNT(*) FROM trips WHERE booking_type = 'SCHEDULED' AND trip_status NOT IN ('CANCELLED', 'COMPLETED', 'MID_CANCELLED')"
    );
    const acceptedScheduledResult = await query(
      "SELECT COUNT(*) FROM trips WHERE booking_type = 'SCHEDULED' AND trip_status = 'ACCEPTED'"
    );

    // Onboarding Pipeline
    const pendingVerificationsResult = await query(
      "SELECT COUNT(*) FROM drivers WHERE is_deleted = false AND kyc_status = 'pending' AND (documents_submitted = true OR id IN (SELECT driver_id FROM driver_documents))"
    );
    const documentExpiryAlertsResult = await query(
      "SELECT COUNT(DISTINCT driver_id) FROM driver_documents WHERE expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND expiry_date >= CURRENT_DATE"
    );

    const activeTripsCount = parseInt(onTripResult.rows[0]?.count || '0');
    const onlineCount = parseInt(onlineResult.rows[0]?.count || '0');

    return {
      totalDrivers: parseInt(totalResult.rows[0]?.count || '0'),
      activeDrivers: parseInt(activeResult.rows[0]?.count || '0'),
      availableDrivers: Math.max(0, onlineCount - activeTripsCount),
      onTripDrivers: activeTripsCount,
      totalScheduledRides: parseInt(totalScheduledResult.rows[0]?.count || '0'),
      acceptedScheduledRides: parseInt(acceptedScheduledResult.rows[0]?.count || '0'),
      todayNewUsers: parseInt(todayUsersResult.rows[0]?.count || '0'),
      todayNewDrivers: parseInt(todayDriversResult.rows[0]?.count || '0'),
      todaySubscriptions: parseInt(todaySubscriptionsResult.rows[0]?.count || '0'),
      pendingVerifications: parseInt(pendingVerificationsResult.rows[0]?.count || '0'),
      documentExpiryAlerts: parseInt(documentExpiryAlertsResult.rows[0]?.count || '0'),
    };
  }


}
