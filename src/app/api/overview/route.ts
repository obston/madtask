import { NextResponse } from 'next/server';
import { q, qOne } from '@/lib/db';
import { resolveClienteId } from '@/lib/tenant';

export async function GET(req: Request) {
  try {
    const clienteId = await resolveClienteId(req);

    const pend = await qOne<{ cnt: number }>(
      `SELECT COUNT(*)::int AS cnt
       FROM public.n8n_vectors
       WHERE cliente_id = $1 AND state = 'pending'`,
      [clienteId]
    );

    const conv24 = await qOne<{ cnt: number }>(
      `SELECT COUNT(DISTINCT session_id)::int AS cnt
       FROM public.n8n_chat_histories
       WHERE cliente_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
      [clienteId]
    );

    const feed = await q<{ role: string; message: string | null; created_at: string }>(
      `SELECT role, message, created_at
       FROM public.n8n_chat_histories
       WHERE cliente_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [clienteId]
    );

    const pendientes_embeddings = pend?.cnt ?? 0;
    const conversaciones_24h   = conv24?.cnt ?? 0;

    return NextResponse.json({
      ok: true,
      // shape nuevo para tu UI actual:
      kpis: { pendientes_embeddings, conversaciones_24h },
      // y dejamos los campos también al nivel raíz por si lo usas en otro lado:
      pendientes_embeddings,
      conversaciones_24h,
      feed,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
