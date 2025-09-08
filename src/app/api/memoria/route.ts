import { NextResponse } from "next/server";
import { listMemories, addMemory, reprocessEmbeddingsMock } from "@/lib/mockStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = (url.searchParams.get("status") ?? undefined) as any;
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 20);
  const data = listMemories({ q, status, page, limit });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = addMemory(body); // { kind, text, source?, status? }
  return NextResponse.json(item, { status: 201 });
}

// acción utilitaria para “reprocesar embeddings”
export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "reprocess") {
    const r = reprocessEmbeddingsMock();
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
