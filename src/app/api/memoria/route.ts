import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { cidFromReq } from "../_utils";

export async function GET(req: Request) {
  const { url, cid } = await cidFromReq(req);
  if (!cid) return NextResponse.json({ ok:false, error:"Cliente no encontrado" }, { status:404 });

  const state = (url.searchParams.get("state") ?? "pending").toLowerCase();
  const qText = (url.searchParams.get("q") ?? "").trim() || null;

  const items = await q<{
    id: number;
    content: string;
    metadata: any;
    state: string;
    created_at: string;
  }>`
    SELECT id, content, metadata, state, created_at::text
    FROM public.n8n_vectors
    WHERE cliente_id = ${cid}
      AND (${state} IS NULL OR state = ${state})
      AND (${qText}::text IS NULL OR content ILIKE '%' || ${qText} || '%')
    ORDER BY created_at DESC
    LIMIT 100
  `;

  return NextResponse.json({ ok: true, items });
}
