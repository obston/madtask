import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { getApiKey, sessionFromKey } from "@/lib/tenant";
import { UltimoMensajeRow } from "@/lib/types";

const N8N_BASE = process.env.N8N_BASE_URL || "http://localhost:5678";

export async function GET(req: Request) {
  try {
    const apiKey = getApiKey(req);
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);

    const rows = await q<UltimoMensajeRow>(
      `SELECT role, message, created_at
         FROM public.n8n_chat_histories
        WHERE session_id = $1
        ORDER BY id DESC
        LIMIT $2`,
      [sessionFromKey(apiKey), limit]
    );

    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo cargar mensajes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = getApiKey(req);
    const { mensaje = "" } = await req.json();
    if (!mensaje?.trim()) return NextResponse.json({ error: "mensaje requerido" }, { status: 400 });

    // Reenvía al webhook n8n /mensaje-entrada (flujo modular actual)
    const r = await fetch(`${N8N_BASE}/webhook/mensaje-entrada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key_publica: apiKey, mensaje }),
    });
    const text = await r.text();
    return NextResponse.json({ ok: r.ok, status: r.status, respuesta: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo enviar mensaje" }, { status: 500 });
  }
}
