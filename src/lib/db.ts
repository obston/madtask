// src/lib/db.ts
import { Pool, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL_RO ?? process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error("Falta DATABASE_URL_RO (o DATABASE_URL) en .env.local para conectarse a Postgres");
}

const globalForPg = globalThis as unknown as { _madtaskPgPool?: Pool };

export const pgPool =
  globalForPg._madtaskPgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "madtask-dashboard",
  });

if (!globalForPg._madtaskPgPool) globalForPg._madtaskPgPool = pgPool;

export async function q<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const start = Date.now();
  const client = await pgPool.connect();
  try {
    const res = await client.query<T>(text, params);
    return res.rows;
  } catch (err: any) {
    console.error("[DB] Error en q()", { text, params, err: err?.message });
    throw err;
  } finally {
    client.release();
    const ms = Date.now() - start;
    // console.log(`[DB] ${ms} ms - ${text}`);
  }
}

export async function dbPing(): Promise<boolean> {
  try {
    await q("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
