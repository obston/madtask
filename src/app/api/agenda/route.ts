import { NextResponse } from "next/server";
import { mockAgenda } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ items: mockAgenda() });
}
