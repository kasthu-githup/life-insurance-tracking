import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

export const isDbConfigured = Boolean(process.env.SQL_HOST || process.env.DATABASE_URL);

// Function to create or retrieve the connection pool.
export const createPool = (): Pool | any => {
  if (!isDbConfigured) {
    return {
      query: async () => ({ rows: [] }),
      connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
      on: () => {},
    };
  }

  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
let dbInstance: any;
try {
  if (isDbConfigured) {
    dbInstance = drizzle(pool, { schema });
  } else {
    console.warn('[AI Studio] PostgreSQL not configured — in-memory mock store active');
    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (d: any) => d?.data ?? {},
      update: async (d: any) => d?.data ?? {},
      delete: async () => ({}),
    };
    dbInstance = new Proxy({}, {
      get: (_, prop) => (prop === 'query' ? new Proxy({}, { get: () => noOp }) : async () => []),
    });
  }
} catch {
  console.warn('[AI Studio] Database connection failed — using mock');
  dbInstance = new Proxy({}, { get: () => async () => [] });
}

export const db = dbInstance;
