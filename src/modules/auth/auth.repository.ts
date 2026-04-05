// src/modules/users/user.repository.ts
import { query } from '../../shared/database';
import { AdminUser } from '../admin-users/adminUser.model';

export const AuthRepository = {
  async getUserData(data: { user_name: string }): Promise<AdminUser> {
    const result = await query('SELECT id, name, password, role FROM admin_users WHERE email = $1', [
      data.user_name,
    ]);
    return result.rows[0];
  },
  async getUserDataById(userId: string): Promise<AdminUser> {
    const result = await query('SELECT id, name, password, role FROM admin_users WHERE id = $1', [
      userId,
    ]);
    return result.rows[0];
  },
  async getUserDataBasedOnResetToken(data: { reset_token: string }): Promise<AdminUser> {
    const result = await query(
      'SELECT id, name, reset_token, reset_token_expiry  FROM admin_users WHERE reset_token = $1',
      [data.reset_token]
    );
    return result.rows[0];
  },
  async updatePassword(data: { userId: string; new_password: string }): Promise<void> {
    await query('UPDATE admin_users SET password = $1 WHERE id = $2', [
      data.new_password,
      data.userId,
    ]);
  },
  async storeResetToken(data: {
    userId: string;
    reset_token: string;
    expires_at: Date | null;
  }): Promise<void> {
    await query('UPDATE admin_users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3', [
      data.reset_token,
      data.expires_at,
      data.userId,
    ]);
  },

  async getUserProfileById(userId: string): Promise<AdminUser | null> {
    const result = await query(
      'SELECT id, name, email, contact, role, created_at, updated_at FROM admin_users WHERE id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },
};
