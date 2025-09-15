import { NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { resolveClienteId } from '@/lib/tenant';

type ConversationListItem = {
  session_id: string;
  phone_or_user: string | null;
  ultimo_mensaje: string | null;
  hora: string;
  estado: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)));
    const qText = (url.searchParams.get('q') || '').trim();

    const clienteId = await resolveClienteId(req);

    const params: any[] = [clienteId];
    let where = 'cliente_id = $1';
    if (qText) {
      params.push(`%${qText}%`);
      where += ` AND message ILIKE $${params.length}`;
    }

    const rows = await q<ConversationListItem>(
      `
      WITH latest AS (
        SELECT DISTINCT ON (session_id)
          session_id,
          telefono_usuario      AS phone_or_user,
          message               AS ultimo_mensaje,
          created_at            AS hora
        FROM public.n8n_chat_histories
        WHERE ${where}
        ORDER BY session_id, created_at DESC
      )
      SELECT session_id, phone_or_user, ultimo_mensaje, hora, 'abierta'::text AS estado
      FROM latest
      ORDER BY hora DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize};
      `,
      params
    );

    return NextResponse.json({ ok: true, items: rows, page, pageSize });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
