// src/app/api/conversaciones/[session_id]/route.ts
import { NextRequest } from "next/server";
import { q } from "@/lib/db";

type Params = { session_id: string };

// GET /api/conversaciones/[session_id]?cursor_before=ISO&limit=40
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { session_id } = await params;
  const sp = new URL(req.url).searchParams;

  const limitParam = Number(sp.get("limit") || 40);
  const limit = Number.isFinite(limitParam) ? Math.min(limitParam, 100) : 40;

  const cursorBefore = sp.get("cursor_before");
  const beforeIso = cursorBefore ? new Date(cursorBefore).toISOString() : null;

  const rows = await q<{
    id: number;
    role: "user" | "assistant" | "system" | "agent";
    message: string;
    created_at: string;
    telefono_usuario: string | null;
    api_key_publica: string | null;
    cliente_id: number | null;
  }>`
    SELECT
      id,
      role,
      message,
      created_at,
      telefono_usuario,
      api_key_publica,
      cliente_id
    FROM public.n8n_chat_histories
    WHERE session_id = ${session_id}
    AND (
      ${beforeIso as string | null}::timestamptz IS NULL
      OR created_at < ${beforeIso as string | null}::timestamptz
    )
    ORDER BY created_at DESC
    LIMIT ${limit + 1}
  `;
  

  const hasMore = rows.length > limit;
  const slice = rows.slice(0, limit);
  const nextCursorBefore = hasMore ? slice[slice.length - 1]!.created_at : null;

  // La UI muestra ASC
  const items = [...slice].reverse();

  return Response.json({ items, nextCursorBefore });
}

// POST /api/conversaciones/[session_id]/reply   body: { message: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { session_id } = await params;
  const body = await req.json().catch(() => ({}));
  const text = (body?.message || "").toString().trim();

  if (!text) {
    return new Response(JSON.stringify({ error: "Mensaje vacío" }), { status: 400 });
  }

  // Tomamos metadatos de la última fila de esa sesión (api_key_publica/cliente/telefono)
  const meta = await q<{
    api_key_publica: string;
    cliente_id: number | null;
    telefono_usuario: string | null;
  }>`
    SELECT api_key_publica, cliente_id, telefono_usuario
    FROM public.n8n_chat_histories
    WHERE session_id = ${session_id}
    ORDER BY id DESC
    LIMIT 1
  `;

  const last = meta[0];
  if (!last?.api_key_publica) {
    return new Response(JSON.stringify({ error: "Sesión desconocida" }), { status: 404 });
  }

  const inserted = await q<{
    id: number;
    role: string;
    message: string;
    created_at: string;
  }>`
    INSERT INTO public.n8n_chat_histories
      (session_id, api_key_publica, cliente_id, role, message, telefono_usuario)
    VALUES (
      ${session_id},
      ${last.api_key_publica},
      ${last.cliente_id},
      'assistant',
      ${text},
      ${last.telefono_usuario}
    )
    RETURNING id, role, message, created_at
  `;

  return Response.json({ item: inserted[0] }, { status: 201 });
}
