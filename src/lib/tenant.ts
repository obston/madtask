import { qOne } from "@/lib/db";

type ReqOrUrl = Request | URL | string | undefined;

export async function resolveClienteId(reqOrUrl?: ReqOrUrl): Promise<number | null> {
  let byId: string | undefined;
  let queryKey: string | undefined;
  let headerKey: string | undefined;

  if (reqOrUrl instanceof Request) {
    const u = new URL(reqOrUrl.url);
    byId = u.searchParams.get("cliente_id") ?? undefined;
    queryKey =
      u.searchParams.get("apiKey") ??
      u.searchParams.get("api_key_publica") ??
      undefined;
    headerKey = reqOrUrl.headers.get("x-api-key") ?? undefined;
  } else if (reqOrUrl instanceof URL || typeof reqOrUrl === "string") {
    const u = new URL(String(reqOrUrl));
    byId = u.searchParams.get("cliente_id") ?? undefined;
    queryKey =
      u.searchParams.get("apiKey") ??
      u.searchParams.get("api_key_publica") ??
      undefined;
  } else {
    // Server Component sin req: usar next/headers (Next 15 → async)
    try {
      const mod = await import("next/headers");
      const h = await mod.headers(); // ← IMPORTANTE: await
      headerKey = h.get("x-api-key") ?? undefined;
    } catch {
      // noop (por ejemplo en build estático)
    }
  }

  if (byId) return Number(byId);

  const apiKey =
    queryKey ??
    headerKey ??
    process.env.CLIENTE_APIKEY_DEFAULT ??
    undefined;

  if (!apiKey) {
    const fallback = Number(process.env.CLIENTE_ID_DEFAULT ?? "");
    return Number.isFinite(fallback) ? fallback : null;
  }

  const row = await qOne<{ id: number }>`
    SELECT id
    FROM public.clientes_config
    WHERE activo = true AND api_key_publica = ${apiKey}
    LIMIT 1
  `;

  if (row?.id) return row.id;

  const fallback = Number(process.env.CLIENTE_ID_DEFAULT ?? "");
  return Number.isFinite(fallback) ? fallback : null;
}
