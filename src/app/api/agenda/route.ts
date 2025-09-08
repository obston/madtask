import { NextResponse } from "next/server";
import { getAgendaRange, createAgendaEvent } from "@/lib/mockStore";
import { startOfWeek, endOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  let from = url.searchParams.get("from");
  let to = url.searchParams.get("to");

  if (!from || !to) {
    const s = startOfWeek(new Date(), { weekStartsOn: 1 });
    const e = endOfWeek(new Date(), { weekStartsOn: 1 });
    from = s.toISOString();
    to = e.toISOString();
  }

  const items = getAgendaRange(from!, to!);
  return NextResponse.json({ items, from, to });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.start_ts || !body.end_ts || !body.timezone) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const created = createAgendaEvent({
    title: body.title,
    start_ts: body.start_ts,
    end_ts: body.end_ts,
    timezone: body.timezone,
    session_id: body.session_id,
    status: body.status ?? "confirmed",
    calendar_id: body.calendar_id,
    external_event_id: body.external_event_id,
  });
  return NextResponse.json(created, { status: 201 });
}
