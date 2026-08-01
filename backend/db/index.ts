import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')
        ? false
        : { rejectUnauthorized: false }, // Supabase & external DBs require SSL
    });
    console.log('📡 Database connection pool initialized.');
  } catch (error) {
    console.error('❌ Failed to initialize database connection pool:', error);
  }
} else {
  console.warn('⚠️ DATABASE_URL is not set. GVMC Data Portal will fall back to mock data services.');
}

/**
 * Execute a SQL query against the PostgreSQL database.
 * Throws an error if the database is not connected or if the query fails.
 */
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  if (!pool) {
    throw new Error('Database connection is not configured.');
  }
  return pool.query(text, params);
}

/**
 * Check if the database connection is active.
 */
export async function isDbConnected(): Promise<boolean> {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (e) {
    return false;
  }
}
