import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1), 100);
    const qText = (searchParams.get("q") || "").trim();
    const offset = (page - 1) * pageSize;

    const params: any[] = [pageSize, offset];
    const whereSearch = qText ? `WHERE lm.message ILIKE $3` : "";
    if (qText) params.push(`%${qText}%`);

    const items = await q<{
      session_id: string;
      last_message_at: string | null;
      last_role: string | null;
      last_message: string | null;
      total_messages: number;
    }>(
      `
      WITH last_msg AS (
        SELECT DISTINCT ON (session_id)
               session_id, role, message, created_at
        FROM public.n8n_chat_histories
        ORDER BY session_id, created_at DESC
      ),
      counts AS (
        SELECT session_id, COUNT(*)::int AS total_messages
        FROM public.n8n_chat_histories
        GROUP BY session_id
      )
      SELECT lm.session_id,
             lm.created_at::text AS last_message_at,
             lm.role AS last_role,
             lm.message AS last_message,
             c.total_messages
      FROM last_msg lm
      JOIN counts c ON c.session_id = lm.session_id
      ${whereSearch}
      ORDER BY lm.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      params
    );

    const [{ total }] = await q<{ total: number }>(
      `SELECT COUNT(DISTINCT session_id)::int AS total FROM public.n8n_chat_histories`
    );

    return NextResponse.json({ page, pageSize, total, items });
  } catch (err: any) {
    console.error("[/api/conversaciones] error:", err);
    return NextResponse.json({ error: err?.message ?? "conversaciones_error" }, { status: 500 });
  }
}
