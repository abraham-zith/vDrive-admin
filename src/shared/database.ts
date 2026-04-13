import { Pool } from 'pg';

let pool: Pool;
export const connectDatabase = async () => {
  try {
    console.log(process.env.DB_HOST, 'process.env.DB_HOST');

    if (!pool) {
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'mydb',
        max: 10,
        idleTimeoutMillis: 30000,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
        ...(process.env.PGCHANNELBINDING === 'require' && {
          application_name: 'myapp',
        }),
      });
    }

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    return pool;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ PostgreSQL connection failed:', errorMessage);
    // Optional detailed debugging:
    console.error('🔍 Full error:', error);
    throw new Error('Database connection failed');
  }
};

// Export a helper to run queries
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase first.');
  }
  return pool.query(text, params);
};

export { pool };
