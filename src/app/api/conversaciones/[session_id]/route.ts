import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ session_id: string }> }
) {
  try {
    const { session_id } = await ctx.params;

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "200", 10), 200);

    // Usa q(sql, params) en lugar de tag template (ver punto 2)
    const rows = await q<{ role: "user"|"assistant"|"system"; message: string|null; created_at: string }>(
      `
      SELECT role, message, created_at
      FROM public.n8n_chat_histories
      WHERE session_id = $1
      ORDER BY id ASC
      LIMIT $2
      `,
      [session_id, limit]
    );

    return NextResponse.json({ ok: true, items: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "No se pudo cargar historial" }, { status: 500 });
  }
}
