import { NextResponse } from "next/server";
import { mockConversationList } from "@/lib/mockData";
import type { ConversationListItem, Estado } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const estadoParam = (url.searchParams.get("estado") ?? "todas") as Estado | "todas";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10));

  // Tu mock actual ya filtra por q; lo usamos como base
  const base = mockConversationList(q) as ConversationListItem[];

  // Counts por estado (con el filtro q aplicado)
  const counts = {
    abierta: base.filter((x) => x.estado === "abierta").length,
    pendiente: base.filter((x) => x.estado === "pendiente").length,
    resuelta: base.filter((x) => x.estado === "resuelta").length,
  };

  // Filtro por estado para la lista paginada
  const filtered =
    estadoParam === "todas" ? base : base.filter((x) => x.estado === estadoParam);

  // Ordena por hora desc (por si tu mock no lo trae ya)
  filtered.sort((a, b) => (a.hora > b.hora ? -1 : 1));

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(page, pages);
  const start = (current - 1) * limit;

  const items = filtered.slice(start, start + limit);

  return NextResponse.json({
    items,
    page: current,
    pages,
    total,
    counts,
  });
}

