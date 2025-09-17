// src/lib/tenant.ts
import { pool, qOne } from '@/lib/db';

type ReqUrl = Request | string;

export async function resolveClienteId(reqOrUrl: ReqUrl): Promise<number | null> {
  const url = new URL(typeof reqOrUrl === 'string' ? reqOrUrl : reqOrUrl.url);

  // 1) cliente_id directo
  const byId = url.searchParams.get('cliente_id');
  if (byId) return Number(byId);

  // 2) apiKey: query o header
  const queryKey = url.searchParams.get('apiKey') || url.searchParams.get('api_key_publica') || undefined;
  const headerKey = typeof reqOrUrl === 'string' ? undefined : reqOrUrl.headers.get('x-api-key') || undefined;
  const apiKey = queryKey || headerKey || process.env.CLIENTE_APIKEY_DEFAULT || null;

  if (!apiKey) return process.env.CLIENTE_ID_DEFAULT ? Number(process.env.CLIENTE_ID_DEFAULT) : null;

  const row = await qOne<{ id: number }>`
    SELECT id FROM public.clientes_config
    WHERE activo = true AND api_key_publica = ${apiKey}
    LIMIT 1
  `;
  return row?.id ?? (process.env.CLIENTE_ID_DEFAULT ? Number(process.env.CLIENTE_ID_DEFAULT) : null);
}
