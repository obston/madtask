// src/lib/db.ts
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL_RO ?? process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error(
    "Falta DATABASE_URL_RO (o DATABASE_URL) en .env.local para conectarse a Postgres"
  );
}

type PgGlobal = typeof globalThis & { _madtaskPgPool?: Pool };
const g = globalThis as PgGlobal;

export const pgPool =
  g._madtaskPgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "madtask-dashboard",
  });

if (!g._madtaskPgPool) g._madtaskPgPool = pgPool;

/**
 * Tag function para SQL con parámetros posicionados ($1, $2…)
 * Uso: const rows = await q<{id:number}>`SELECT id FROM x WHERE a = ${val}`;
 */
export async function q<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  // Construye el texto con $1, $2, …
  let text = "";
  const params: any[] = [];
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }

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
    // const ms = Date.now() - start;
    // console.log(`[DB] ${ms} ms - ${text}`);
  }
}

export async function dbPing(): Promise<boolean> {
  try {
    await q`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
