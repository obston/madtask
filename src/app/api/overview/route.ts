import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { getApiKey, sessionFromKey } from "@/lib/tenant";
import type { KpiPendientesRow, UltimoMensajeRow } from "@/lib/types";


export async function GET(req: Request) {
  try {
    const apiKey = getApiKey(req);
    const [cli] = await q<{ id: number }>(
      `SELECT id FROM public.clientes_config WHERE activo = true AND api_key_publica = $1 LIMIT 1`,
      [apiKey]
    );
    if (!cli) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

    const [kpi] = await q<KpiPendientesRow>(
      `SELECT COUNT(*)::int AS pendientes
         FROM public.n8n_vectors
        WHERE cliente_id = $1 AND embedding IS NULL`,
      [cli.id]
    );

    const rows = await q<UltimoMensajeRow>(
      `SELECT role, message, created_at
         FROM public.n8n_chat_histories
        WHERE session_id = $1
        ORDER BY id DESC
        LIMIT 10`,
      [sessionFromKey(apiKey)]
    );

    return NextResponse.json({
      ok: true,
      kpis: { pendientes_embeddings: kpi?.pendientes ?? 0 },
      feed: rows.map((r, i) => ({ id: i, role: r.role, message: r.message, created_at: r.created_at })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo cargar overview" }, { status: 500 });
  }
}
