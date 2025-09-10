import { NextRequest, NextResponse } from "next/server";
import { q } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "session_id es obligatorio" }, { status: 400 });

    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200);
    const cursor = searchParams.get("cursor");

    const params: any[] = [sessionId, limit];
    const cursorClause = cursor ? "AND created_at < $3::timestamptz" : "";
    if (cursor) params.push(cursor);

    const rows = await q<{ id: number; role: string; message: string | null; created_at: string }>(
      `
      SELECT id, role, message, created_at::text
      FROM public.n8n_chat_histories
      WHERE session_id = $1
      ${cursorClause}
      ORDER BY created_at DESC
      LIMIT $2
      `,
      params
    );

    const items = rows.slice().reverse();
    const nextCursor = rows.length === limit ? rows[rows.length - 1].created_at : null;

    return NextResponse.json({ session_id: sessionId, items, nextCursor });
  } catch (err: any) {
    console.error("[/api/mensajes GET] error:", err);
    return NextResponse.json({ error: err?.message ?? "mensajes_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = process.env.N8N_WEBHOOK_URL!;
    const body = await req.json().catch(() => ({}));
    if (!body?.api_key_publica || !body?.mensaje) {
      return NextResponse.json({ error: "Faltan api_key_publica o mensaje" }, { status: 400 });
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? JSON.parse(text) : text;

    return NextResponse.json({ ok: res.ok, status: res.status, data }, { status: res.ok ? 200 : res.status });
  } catch (err: any) {
    console.error("[/api/mensajes POST] error:", err);
    return NextResponse.json({ error: err?.message ?? "mensajes_proxy_error" }, { status: 500 });
  }
}
