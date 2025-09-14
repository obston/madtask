import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { getApiKey } from "@/lib/tenant";

type ConversationListItem = {
  session_id: string;
  phone_or_user: string;
  ultimo_mensaje: string;
  hora: string;        // ISO string
  estado: string;      // por ahora “abierta”
};

export async function GET(req: Request) {
  try {
    const apiKey = getApiKey(req);
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "20", 10), 1), 100);
    const qText = (url.searchParams.get("q") || "").trim();

    // 1) Cliente
    const cli = await q<{ id: number }>(
      `SELECT id FROM public.clientes_config WHERE activo = true AND api_key_publica = $1 LIMIT 1`,
      [apiKey],
    );
    if (!cli[0]) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    const cliId = cli[0].id;

    // 2) WHERE + params dinámicos (evita huecos $3, $4… cuando no hay búsqueda)
    const whereParts: string[] = [`ch.cliente_id = $1`];
    const params: any[] = [cliId];

    if (qText) {
      params.push(`%${qText}%`);
      whereParts.push(`ch.message ILIKE $${params.length}`);
    }
    const whereSQL = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    // 3) Total (para paginar)
    const totalRows = await q<{ total: number }>(
      `SELECT COUNT(*)::int AS total
         FROM (
           SELECT DISTINCT ch.session_id
             FROM public.n8n_chat_histories ch
             ${whereSQL}
         ) s`,
      params,
    );
    const total = totalRows[0]?.total ?? 0;
    const pages = Math.max(Math.ceil(total / pageSize), 1);
    const offset = (page - 1) * pageSize;

    // 4) Items (último mensaje por sesión)
    //    DISTINCT ON + ORDER BY id DESC para tomar el último
    const items = await q<ConversationListItem>(
      `
      WITH last_msg AS (
        SELECT DISTINCT ON (ch.session_id)
               ch.session_id,
               ch.message,
               ch.created_at
          FROM public.n8n_chat_histories ch
          ${whereSQL}
         ORDER BY ch.session_id, ch.id DESC
      )
      SELECT
        lm.session_id,
        ''::text AS phone_or_user,
        COALESCE(lm.message, '') AS ultimo_mensaje,
        to_char(lm.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') AS hora,
        'abierta'::text AS estado
      FROM last_msg lm
      ORDER BY lm.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `,
      [...params, pageSize, offset],
    );

    return NextResponse.json({
      items, page, pages, total,
      counts: { abierta: total, pendiente: 0, resuelta: 0 },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo cargar conversaciones" }, { status: 500 });
  }
}
