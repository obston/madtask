import { NextResponse } from "next/server";
import { qOne } from "@/lib/db";
import { cidFromReq } from "../_utils";

export async function GET(req: Request) {
  const { cid } = await cidFromReq(req);
  if (!cid) return NextResponse.json({ ok:false, error:"Cliente no encontrado" }, { status:404 });

  const pend = await qOne<{ n:number }>`
     SELECT COUNT(*)::int AS n
     FROM public.n8n_vectors
     WHERE cliente_id = ${cid} AND state = 'pending'
   `;

   const c24 = await qOne<{ n:number }>`
   SELECT COUNT(DISTINCT session_id)::int AS n
   FROM public.n8n_chat_histories
   WHERE cliente_id = ${cid} AND created_at > now() - interval '24 hours'
 `;

  return NextResponse.json({
    ok: true,
    kpis: {
      pendientes_embeddings: pend?.n ?? 0,
      conversaciones_24h: c24?.n ?? 0,
    },
  });
}
