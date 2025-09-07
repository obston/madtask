import { NextResponse } from "next/server";
import { appendMessage } from "@/lib/mockStore";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ session_id: string }> } // 👈 Promise
) {
  const { session_id } = await params;                    // 👈 await

  const { text, agent } = await req.json().catch(() => ({}));
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const role = agent === "human" ? "user" : "bot";
  const msg = { role, text, ts: new Date().toISOString() } as const;

  const updated = appendMessage(session_id, msg);
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true, message: msg });
}
