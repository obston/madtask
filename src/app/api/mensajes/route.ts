import { NextResponse } from "next/server";
import { pool, q, qOne } from '@/lib/db';
import { resolveClienteId } from "@/lib/tenant";

const N8N_BASE = process.env.N8N_BASE_URL || "http://localhost:5678";

export async function GET(req: Request) {
  try {
    const clienteId = await resolveClienteId(req);
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);

    const rows = await q<{ role: string; message: string | null; created_at: string }>`
+      SELECT role, message, created_at::text
+      FROM public.n8n_chat_histories
+      WHERE cliente_id = ${clienteId}
+      ORDER BY id DESC
+      LIMIT ${limit}
+    `;

    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo cargar mensajes" }, { status: 500 });
  }
}

// ...
export async function POST(req: Request) {
  try {
    const clienteId = await resolveClienteId(req);
    const url = new URL(req.url);

    // 1) mensaje
    const { mensaje = "" } = await req.json();
    if (!mensaje?.trim()) {
      return NextResponse.json({ error: "mensaje requerido" }, { status: 400 });
    }

    // 2) apiKey (query -> BD -> error)
    const apiKeyFromQuery =
      url.searchParams.get("apiKey") ??
      url.searchParams.get("api_key_publica") ??
      undefined;

    let apiKey: string | undefined = apiKeyFromQuery;

    if (!apiKey) {
      const row = await qOne<{ api_key_publica: string | null }>`
+        SELECT api_key_publica
+        FROM public.clientes_config
+        WHERE id = ${clienteId}
+        LIMIT 1
+      `;
      apiKey = row?.api_key_publica ?? undefined;
    }

    if (!apiKey) {
      return NextResponse.json({ error: "apiKey no disponible" }, { status: 400 });
    }

    // 3) webhook n8n
    const N8N_BASE = process.env.N8N_BASE_URL || "http://127.0.0.1:5678"; // 👈 usa 127.0.0.1 por el túnel
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
