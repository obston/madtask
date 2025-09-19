// src/app/api/conversaciones/route.ts
import { NextRequest } from "next/server";
import { q } from "@/lib/db";

// Lista de conversaciones para el sidebar
export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;

  // q: texto libre; cursor: para paginación por fecha; limit: tope
  const qtext = (searchParams.get("q") ?? "").trim();
  const like = qtext ? `%${qtext}%` : null;

  const cursor = searchParams.get("cursor");
  const beforeIso = cursor ? new Date(cursor).toISOString() : null;

  const limitParam = Number(searchParams.get("limit") ?? 20);
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 20;

  // Consulta: una fila por session_id (la más reciente)
  const rows = await q<{
    session_id: string;
    api_key_publica: string | null;
    cliente_id: number | null;
    telefono_usuario: string | null;
    role: "user" | "assistant" | "system" | "agent";
    last_message: string | null;
    last_at: string;
  }>`
    SELECT DISTINCT ON (session_id)
      session_id,
      api_key_publica,
      cliente_id,
      telefono_usuario,
      role,
      message AS last_message,
      created_at AS last_at
    FROM public.n8n_chat_histories
    WHERE 1=1
      ${like ? q` AND (session_id ILIKE ${like} OR message ILIKE ${like})` : q``}
      ${beforeIso ? q` AND created_at < ${beforeIso}` : q``}
    ORDER BY session_id, created_at DESC
    LIMIT ${limit + 1}
  `;

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const nextCursor = hasMore ? items[items.length - 1]!.last_at : null;

  return Response.json({ items, nextCursor });
}
