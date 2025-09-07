import { NextResponse } from "next/server";
import { overviewMock } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(overviewMock);
}
