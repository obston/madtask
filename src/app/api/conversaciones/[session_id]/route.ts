import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { resolveClienteId } from "@/lib/tenant";

type Ctx = { params: Promise<{ session_id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { session_id } = await ctx.params;                    // << antes accedías directo
  const url = new URL(req.url);
  const limit = Math.min(500, parseInt(url.searchParams.get("limit") ?? "200", 10));

  const cid = await resolveClienteId(req);                    // << pásale el Request
  if (!cid) {
    return NextResponse.json({ ok: false, error: "Cliente no encontrado" }, { status: 404 });
  }

  const rows = await q<{ role: "user" | "assistant" | "system"; message: string | null; created_at: string }>`
    SELECT role, message, created_at::text
    FROM public.n8n_chat_histories
    WHERE cliente_id = ${cid} AND session_id = ${session_id}
    ORDER BY id ASC
    LIMIT ${limit}
  `;

  return NextResponse.json({ ok: true, rows });
}
