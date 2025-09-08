import { NextResponse } from "next/server";
import { getFeed } from "@/lib/mockStore";
import type { FeedListResponse, FeedKind } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const type = (url.searchParams.get("type") as FeedKind | "todas" | null) ?? "todas";
  const resolved = (url.searchParams.get("resolved") as "true" | "false" | null) ?? undefined; // 👈 casteo
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);

  const { items, total, summary } = getFeed({ q, type, resolved, page, limit });

  const body: FeedListResponse = { items, total, page, limit, summary };
  return NextResponse.json(body);
}
