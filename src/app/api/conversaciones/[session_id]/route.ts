// src/app/api/conversaciones/[session_id]/route.ts
import { NextResponse } from 'next/server';
import { pool, q, qOne } from '@/lib/db';
import { resolveClienteId } from '../../_utils';

export async function GET(req: Request, ctx: { params: { session_id: string } }) {
  const url = new URL(req.url);
  const limit = Math.min(500, parseInt(url.searchParams.get('limit') ?? '200', 10));

  const cid = await resolveClienteId({
    apiKey: url.searchParams.get('apiKey'),
    cliente_id: url.searchParams.get('cliente_id'),
  });
  if (!cid) return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });

  const rows = await q<{ role: 'user'|'assistant'|'system'; message: string | null; created_at: string }>`
   SELECT role, message, created_at::text
    FROM public.n8n_chat_histories
    WHERE cliente_id = ${cid} AND session_id = ${ctx.params.session_id}
    ORDER BY id DESC
    LIMIT ${limit}
  `;
    [cid, ctx.params.session_id, limit]
  ;

  return NextResponse.json({ ok: true, items: rows });
}
