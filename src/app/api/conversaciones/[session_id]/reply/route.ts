// src/app/api/conversaciones/[session_id]/reply/route.ts
import { NextResponse } from "next/server";
import { resolveClienteId } from "@/lib/tenant";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ session_id: string }> }
) {
  const { session_id } = await ctx.params;
  const cid = await resolveClienteId(req);
  if (!cid) return NextResponse.json({ ok: false, error: "no-tenant" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const text = (body?.text ?? "").toString().trim();
  if (!text) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  // TODO: aquí se integra a n8n / proveedor de mensajería
  // Por ahora, simulamos que aceptamos el envío.
  return NextResponse.json({ ok: true, session_id, accepted: true });
}

