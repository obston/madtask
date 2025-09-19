// src/app/api/overview/chart/route.ts
import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { resolveClienteId } from "@/lib/tenant";

type Point = { date: string; chats: number };

export async function GET(req: Request) {
  // Resuelve cliente y aplica fallback seguro
  const resolved = await resolveClienteId(req);
  const fallbackEnv = parseInt(process.env.CLIENTE_ID_DEFAULT ?? "0", 10);
  const clienteId: number = Number.isFinite(resolved as number)
    ? (resolved as number)
    : Number.isFinite(fallbackEnv)
    ? fallbackEnv
    : 0; // último recurso (no rompe el tipo)
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "15d"; // 7d | 15d | 30d
  const days =
    period === "30d" ? 30 :
    period === "7d"  ? 7  : 15;

  // Serie completa de días para evitar huecos
  const conversations = await q<Point>`
    WITH days AS (
      SELECT generate_series((now()::date - interval '${days} days')::date, now()::date, '1 day')::date AS d
    ),
    counts AS (
      SELECT created_at::date AS d, COUNT(*)::int AS n
      FROM public.n8n_chat_histories
      WHERE cliente_id = ${clienteId}
        AND created_at >= now()::date - interval '${days} days'
      GROUP BY 1
    )
    SELECT to_char(days.d, 'YYYY-MM-DD') AS date,
           COALESCE(counts.n, 0)::int AS chats
    FROM days
    LEFT JOIN counts ON counts.d = days.d
    ORDER BY days.d
  `;

  const fallbacks = await q<Point>`
    WITH days AS (
      SELECT generate_series((now()::date - interval '${days} days')::date, now()::date, '1 day')::date AS d
    ),
    counts AS (
      SELECT created_at::date AS d, COUNT(*)::int AS n
      FROM public.n8n_chat_histories
      WHERE cliente_id = ${clienteId}
        AND created_at >= now()::date - interval '${days} days'
        AND (metadata->>'estado') = 'fallback'
      GROUP BY 1
    )
    SELECT to_char(days.d, 'YYYY-MM-DD') AS date,
           COALESCE(counts.n, 0)::int AS chats
    FROM days
    LEFT JOIN counts ON counts.d = days.d
    ORDER BY days.d
  `;

  return NextResponse.json({
    ok: true,
    period: `${days}d`,
    conversations,
    fallbacks,
  });
}
