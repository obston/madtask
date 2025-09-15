// src/lib/db.ts
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

declare global {
  // Evita múltiples pools en dev por HMR
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

if (!global._pgPool) global._pgPool = pool;

/**
 * Query helper tipado. OJO: T debe extender QueryResultRow (requisito de pg).
 */
export async function q<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[],
  client?: PoolClient
): Promise<T[]> {
  const c = client ?? (await pool.connect());
  try {
    const res: QueryResult<T> = await c.query<T>(text, params);
    return res.rows;
  } finally {
    if (!client) c.release();
  }
}

/** Devuelve una sola fila o null. */
export async function qOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[],
  client?: PoolClient
): Promise<T | null> {
  const rows = await q<T>(text, params, client);
  return rows[0] ?? null;
}
