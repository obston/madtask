import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

type FeedRow = {
  id: number;
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string; // ISO
};

type CountRow = { role: string; n: number };

export async function GET() {
  try {
    // En esta primera iteración usamos la sesión ficticia fija
    const session_id = "pub_amazing_101_chat";

    // Últimos 5 mensajes de esa sesión (más recientes primero)
    const rows = await q<FeedRow>`
      SELECT
        id,
        role::text,
        message,
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS created_at
      FROM n8n_chat_histories
      WHERE session_id = ${session_id}
      ORDER BY id DESC
      LIMIT 5
    `;

    // Contadores por rol (opcional para tarjetas del overview)
    const counts = await q<CountRow>`
      SELECT role::text AS role, COUNT(*)::int AS n
      FROM n8n_chat_histories
      WHERE session_id = ${session_id}
      GROUP BY role
    `;

    return NextResponse.json({
      ok: true,
      feed: rows,     // ojo: vienen DESC; si quieres asc, invierte con .toReversed()
      counts,
    });
  } catch (err: any) {
    console.error("[/api/overview] error:", err?.message);
    return NextResponse.json(
      { error: "overview_error", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
