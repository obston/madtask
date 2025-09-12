// src/app/api/conversaciones/[session_id]/route.ts
import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { session_id: string } }) {
  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "20", 10), 1), 100);
    const qText = (url.searchParams.get("q") || "").trim();
    const sessionId = params.session_id;
    const offset = (page - 1) * pageSize;

    const whereSearch = qText ? "AND message ILIKE $3" : "";
    const pageParams = qText ? [sessionId, pageSize, `%${qText}%`, offset] : [sessionId, pageSize, offset];

    const items = await q<{ id:number; role:"user"|"assistant"|"system"; message:string|null; created_at:string }>(
      `SELECT id, role, message, created_at
         FROM public.n8n_chat_histories
        WHERE session_id = $1
          ${whereSearch}
        ORDER BY id DESC
        LIMIT $2
        OFFSET $${qText ? 4 : 3}`,
      pageParams
    );
    const [{ total }] = await q<{ total:number }>(
      `SELECT COUNT(*)::int AS total
         FROM public.n8n_chat_histories
        WHERE session_id = $1
          ${qText ? "AND message ILIKE $2" : ""}`,
      qText ? [sessionId, `%${qText}%`] : [sessionId]
    );

    return NextResponse.json({ ok: true, page, pageSize, total, data: items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo cargar la conversación" }, { status: 500 });
  }
}
