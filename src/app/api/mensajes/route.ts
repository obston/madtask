import { NextResponse } from "next/server";
import { mockFeed } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const type = url.searchParams.get("type") ?? "all";
  return NextResponse.json({ items: mockFeed(q, type) });
}
