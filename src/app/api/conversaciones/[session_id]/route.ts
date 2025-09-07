import { NextResponse } from "next/server";
import { getOrInitConversation } from "@/lib/mockStore";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ session_id: string }> } // 👈 Promise
) {
  const { session_id } = await params;                    // 👈 await
  const data = getOrInitConversation(session_id);
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}

