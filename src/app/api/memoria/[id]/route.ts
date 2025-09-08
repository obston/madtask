import { NextResponse } from "next/server";
import { setMemoryStatus } from "@/lib/mockStore";

export async function PATCH(_: Request, ctx: { params: Promise<{ id: string }>}) {
  const { id } = await ctx.params; // Next 15: params es Promise
  const { status } = await _.json(); // { status: "approved" | ... }
  const item = setMemoryStatus(id, status);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(item);
}
