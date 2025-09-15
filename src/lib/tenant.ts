import type { PoolClient } from 'pg';
import { pool, qOne } from '@/lib/db';

/**
 * Devuelve el cliente_id a partir de:
 * - ?cliente_id=123
 * - ?apiKey=pub_xxx  (alias)  |  ?api_key_publica=pub_xxx
 * - header x-api-key: pub_xxx
 * Fallbacks: process.env.CLIENTE_APIKEY_DEFAULT o process.env.CLIENTE_ID_DEFAULT
 */
export async function resolveClienteId(
  reqOrUrl: Request | string,
  client?: PoolClient
): Promise<number> {
  const url = new URL(typeof reqOrUrl === 'string' ? reqOrUrl : reqOrUrl.url);

  // 1) Prioriza cliente_id directo
  const byId = url.searchParams.get('cliente_id');
  if (byId) return Number(byId);

  // 2) Toma apiKey por query o header
  const qKey = url.searchParams.get('apiKey') || url.searchParams.get('api_key_publica') || undefined;
  const hKey = typeof reqOrUrl !== 'string'
    ? (reqOrUrl.headers.get('x-api-key') ?? undefined)
    : undefined;
  const key = qKey || hKey || process.env.CLIENTE_APIKEY_DEFAULT || null;

  const c = client ?? (await pool.connect());
  try {
    if (key) {
      const row = await qOne<{ id: number }>(
        `SELECT id FROM public.clientes_config
         WHERE activo = true AND api_key_publica = $1
         LIMIT 1`,
        [key],
        c
      );
      if (row?.id) return row.id;
    }

    const fallback = process.env.CLIENTE_ID_DEFAULT
      ? Number(process.env.CLIENTE_ID_DEFAULT)
      : NaN;
    if (!Number.isNaN(fallback)) return fallback;

    throw new Error('cliente_id no definido (usa ?cliente_id=, ?apiKey= o header x-api-key)');
  } finally {
    if (!client) c.release();
  }
}
