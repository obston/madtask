import { pool, q, qOne } from '@/lib/db';

// Resuelve el cliente a partir de apiKey o cliente_id
export async function resolveClienteId(opts: {
  apiKey?: string | null;
  cliente_id?: string | null;
}): Promise<number | null> {
  if (opts.cliente_id) return parseInt(opts.cliente_id, 10);

  const apiKey = opts.apiKey ?? process.env.CLIENTE_APIKEY_DEFAULT ?? "";
  if (!apiKey) return null;

  const row = await qOne<{ id: number }>`
     SELECT id FROM public.clientes_config
     WHERE activo = true AND api_key_publica = ${apiKey}
     LIMIT 1
   `;
  return row?.id ?? null;
}

// Helper común en handlers
export async function cidFromReq(req: Request) {
  const url = new URL(req.url);
  const cid = await resolveClienteId({
    apiKey: url.searchParams.get("apiKey"),
    cliente_id: url.searchParams.get("cliente_id"),
  });
  return { url, cid };
}

