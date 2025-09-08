import { getBaseUrl } from "@/lib/getBaseUrl";
import AgendaGrid from "@/components/AgendaGrid";
import { startOfWeek, endOfWeek } from "date-fns";
import type { AgendaEvent } from "@/lib/types";

async function getData(fromISO: string, toISO: string): Promise<{ items: AgendaEvent[]; from: string; to: string }> {
  const base = await getBaseUrl();
  const url = `${base}/api/agenda?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar agenda");
  return res.json();
}

export default async function AgendaPage() {
  const from = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const to = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const { items, from: f, to: t } = await getData(from, to);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <AgendaGrid initialEvents={items} startISO={f} endISO={t} />
    </div>
  );
}
