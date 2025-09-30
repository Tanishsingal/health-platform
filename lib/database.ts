// =====================================================
// DATABASE CONNECTION MODULE
// PostgreSQL connection and query utilities for Neon DB
// =====================================================

import { Pool, PoolClient, QueryResult } from 'pg';

// =====================================================
// DATABASE CONFIGURATION
// =====================================================

const dbConfig = {
  // Support both connection string and individual parameters
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'neondb_owner',
  host: process.env.DB_HOST || 'ep-holy-fog-ad56sest-pooler.c-2.us-east-1.aws.neon.tech',
  database: process.env.DB_NAME || 'neondb',
  password: process.env.DB_PASSWORD || 'npg_TfCLG5ti0ean',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Neon requires SSL but with self-signed certificates
  } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for cloud database
};

// =====================================================
// CONNECTION POOL
// =====================================================

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit process in production, just log the error
      if (process.env.NODE_ENV !== 'production') {
        process.exit(-1);
      }
    });

    // Log successful connection in development
    if (process.env.NODE_ENV === 'development') {
      pool.on('connect', () => {
        console.log('🔗 Connected to Neon database');
      });
    }
  }
  
  return pool;
}

// =====================================================
// QUERY UTILITIES
// =====================================================

export interface DatabaseResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
}

export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<DatabaseResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log('🐌 Slow query detected:', { text: text.substring(0, 100), duration, params });
    }
    
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
      command: result.command
    };
  } catch (error) {
    console.error('❌ Database query error:', { 
      text: text.substring(0, 100), 
      params, 
      error: error instanceof Error ? error.message : error 
    });
    throw error;
  }
}

// =====================================================
// TRANSACTION UTILITIES
// =====================================================

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// =====================================================
// HEALTH CHECK
// =====================================================

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Database health check passed:', {
        time: result.rows[0]?.current_time,
        version: result.rows[0]?.db_version?.substring(0, 50) + '...'
      });
    }
    return result.rows.length > 0;
  } catch (error) {
    console.error('❌ Database connection check failed:', error);
    return false;
  }
}

// =====================================================
// CLEANUP
// =====================================================

export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connection pool closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing database connections...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing database connections...');
  await closeDatabaseConnection();
  process.exit(0);
}); 