import { NextResponse } from "next/server";
import { q } from "@/lib/db";

type MensajeItem = {
  id: number;
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string; // ISO
};

type MensajesResponse = {
  session_id: string;
  items: MensajeItem[];
  page: number;
  limit: number;
  total: number;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const session_id = (searchParams.get("session_id") ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.max(1, Math.min(200, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;

  if (!session_id) {
    return NextResponse.json({ error: "Falta session_id" }, { status: 400 });
  }

  // Total
  const totalRows = await q<{ count: string }>`
    SELECT COUNT(*)::text AS count
    FROM n8n_chat_histories
    WHERE session_id = ${session_id}
  `;
  const total = Number(totalRows[0]?.count ?? 0);

  // Mensajes (orden ascendente para leer la historia en orden)
  const rows = await q<MensajeItem>`
    SELECT
      id,
      role::text,
      message,
      to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ') AS created_at
    FROM n8n_chat_histories
    WHERE session_id = ${session_id}
    ORDER BY id ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const payload: MensajesResponse = {
    session_id,
    items: rows,
    page,
    limit,
    total,
  };
  return NextResponse.json(payload);
}
