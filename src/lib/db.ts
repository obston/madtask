// src/lib/db.ts
import { Pool, QueryResult, QueryResultRow } from "pg";

// -----------------------------
// Pool singleton (seguro para HMR)
// -----------------------------
type GlobalWithPg = typeof globalThis & { __madtaskPgPool?: Pool };

const CONNECTION_STRING =
  process.env.DATABASE_URL_RO ??
  process.env.DATABASE_URL ??
  "";

if (!CONNECTION_STRING) {
  throw new Error(
    "Falta DATABASE_URL_RO o DATABASE_URL en .env.local para conectarse a Postgres"
  );
}

const isProd = process.env.NODE_ENV === "production";
const sslMode =
  process.env.PGSSL?.toLowerCase() ?? (isProd ? "require" : "disable");

// Nota: usa PGSSL=require|disable para controlar esto desde .env
const ssl =
  sslMode === "require"
    ? (process.env.PGSSL_REJECT_UNAUTHORIZED === "false"
        ? { rejectUnauthorized: false }
        : true)
    : false;

const globalForPg = globalThis as GlobalWithPg;

export const pgPool: Pool =
  globalForPg.__madtaskPgPool ??
  new Pool({
    connectionString: CONNECTION_STRING,
    ssl,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "madtask-dashboard",
  });

if (!globalForPg.__madtaskPgPool) globalForPg.__madtaskPgPool = pgPool;

// -----------------------------
// Utilidades de query
// -----------------------------
export type Row = QueryResultRow & Record<string, any>;

/** Forma 1: q(text, params) */
export async function q<T extends Row = Row>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const started = Date.now();
  const client = await pgPool.connect();
  try {
    // Forzamos un statement_timeout por sesión si lo pides en .env (ms)
    const st = parseInt(process.env.PG_STATEMENT_TIMEOUT_MS || "", 10);
    if (Number.isFinite(st) && st > 0) {
      await client.query(`SET statement_timeout = ${st}`);
    }

    const res: QueryResult<T> = await client.query(text, params);

    if (process.env.NODE_ENV !== "production") {
      const ms = Date.now() - started;
      // recortamos el SQL para log
      console.log(`[DB] ${ms}ms ${text.slice(0, 120)}...`, { params });
    }
    return res.rows;
  } catch (err: any) {
    console.error("[DB] Error en q()", {
      text: text.slice(0, 200),
      params,
      err: err?.message,
    });
    throw err;
  } finally {
    client.release();
  }
}

/** Forma 2: sql` ... ${val} ...` → usa posiciones $1, $2 automáticamente */
export function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): { text: string; params: any[] } {
  const params: any[] = [];
  let text = "";
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }
  return { text, params };
}

/** Helper: ejecuta una plantilla sql y devuelve rows */
export async function qSql<T extends Row = Row>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  const { text, params } = sql(strings, ...values);
  return q<T>(text, params);
}

export async function dbPing(): Promise<boolean> {
  try {
    await q("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

// -----------------------------
// Funciones de dominio (idénticas a tu propuesta con pequeños ajustes)
// -----------------------------
export interface ChatMessage extends Row {
  id: number;
  session_id: string;
  api_key_publica: string;
  cliente_id: number;
  role: "user" | "assistant" | "system";
  message: string;
  created_at: Date;
}

export interface ClienteConfig extends Row {
  id: number;
  nombre_cliente: string;
  api_key_publica: string;
  phone_number_id: string;
  tipo_negocio: string;
  mensaje_saludo: string;
  mensaje_fuera_contexto: string;
  mensaje_sin_resultado: string;
  prompt_ia_json: any;
  activo: boolean;
}

export interface VectorRecord extends Row {
  id: number;
  cliente_id: number;
  content: string;
  metadata: any;
  embedding?: number[];
  created_at: Date;
}

// Config de cliente
export async function getClientConfig(
  apiKeyPublica: string
): Promise<ClienteConfig | null> {
  const rows = await q<ClienteConfig>(
    `
    SELECT id, nombre_cliente, api_key_publica, phone_number_id, tipo_negocio,
           mensaje_saludo, mensaje_fuera_contexto, mensaje_sin_resultado,
           prompt_ia_json, activo
    FROM public.clientes_config
    WHERE activo = true AND api_key_publica = $1
    LIMIT 1
  `,
    [apiKeyPublica]
  );
  return rows[0] ?? null;
}

// Historial por sesión
export async function getChatHistory(
  sessionId: string,
  limit = 5
): Promise<ChatMessage[]> {
  return q<ChatMessage>(
    `
    SELECT id, session_id, api_key_publica, cliente_id, role, message, created_at
    FROM public.n8n_chat_histories
    WHERE session_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `,
    [sessionId, limit]
  );
}

// Guardar mensaje
export async function saveChatMessage(
  sessionId: string,
  apiKeyPublica: string,
  clienteId: number,
  role: "user" | "assistant" | "system",
  message: string
): Promise<void> {
  await q(
    `
    INSERT INTO public.n8n_chat_histories
      (session_id, api_key_publica, cliente_id, role, message)
    VALUES ($1, $2, $3, $4, $5)
  `,
    [sessionId, apiKeyPublica, clienteId, role, message]
  );
}

// Buscar vectores (pgvector)
export async function searchVectors(
  clienteId: number,
  embedding: number[],
  limit = 6,
  recencyDays?: number
): Promise<Array<VectorRecord & { dist: number }>> {
  // pgvector acepta string '[1,2,3]' → JSON.stringify([1,2,3]) produce eso
  const vec = JSON.stringify(embedding);
  const recency = Number.isFinite(recencyDays)
    ? `AND created_at >= NOW() - ($4::text || ' days')::interval`
    : "";

  const sqlText = `
    SELECT id, cliente_id, content, metadata,
           (embedding <=> $2::vector) AS dist,
           created_at
    FROM public.n8n_vectors
    WHERE cliente_id = $1::int
      AND embedding IS NOT NULL
      ${recency}
    ORDER BY embedding <=> $2::vector
    LIMIT $3
  `;

  const params = Number.isFinite(recencyDays)
    ? [clienteId, vec, limit, recencyDays]
    : [clienteId, vec, limit];

  return q(sqlText, params);
}

export async function countPendingEmbeddings(
  clienteId: number
): Promise<number> {
  const rows = await q<{ count: string }>(
    `
    SELECT COUNT(*)::text AS count
    FROM public.n8n_vectors
    WHERE cliente_id = $1::int
      AND embedding IS NULL
  `,
    [clienteId]
  );
  return parseInt(rows[0]?.count ?? "0", 10);
}
