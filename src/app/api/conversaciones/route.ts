import { NextResponse } from "next/server";
import { mockConversationList } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const items = mockConversationList(q);
  return NextResponse.json({ items });
}
