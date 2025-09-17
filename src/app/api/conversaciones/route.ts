import { NextResponse } from "next/server";
import { pool, q, qOne } from '@/lib/db';
import { cidFromReq } from "../_utils";

export async function GET(req: Request) {
  const { url, cid } = await cidFromReq(req);
  if (!cid) return NextResponse.json({ ok:false, error:"Cliente no encontrado" }, { status:404 });

  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10), 1);
  const pageSize = Math.min(100, Math.max(parseInt(url.searchParams.get("pageSize") ?? "20", 10), 10));
  const offset = (page - 1) * pageSize;
  const qText = (url.searchParams.get("q") ?? "").trim() || null;

  const rows = await q<{
    session_id: string;
    ultimo_mensaje: string | null;
    hora: string | null;
  }>`
    WITH latest AS (
      SELECT DISTINCT ON (session_id) id, session_id, message, created_at
      FROM public.n8n_chat_histories
      WHERE cliente_id = ${cid}
      ORDER BY session_id, id DESC
    )
    SELECT
      l.session_id,
      l.message AS ultimo_mensaje,
      l.created_at::text AS hora
    FROM latest l
    WHERE ${qText}::text IS NULL OR l.message ILIKE '%' || ${qText} || '%'
    ORDER BY l.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  return NextResponse.json({ ok:true, items: rows });
}
