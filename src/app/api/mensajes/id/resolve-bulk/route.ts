import { NextResponse } from "next/server";
import { resolveFeedBulk } from "@/lib/mockStore";
import type { FeedKind } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const type = (url.searchParams.get("type") as FeedKind | "todas" | null) ?? "todas";
  const resolved = (url.searchParams.get("resolved") as "true" | "false" | null) ?? undefined;

  const { updated } = resolveFeedBulk({ q, type, resolved });
  return NextResponse.json({ updated });
}
