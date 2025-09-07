import { getBaseUrl } from "@/lib/getBaseUrl";
import type { AgendaEvent } from "@/lib/types";

async function getData(): Promise<AgendaEvent[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/agenda`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar agenda");
  const json = await res.json();
  return json.items as AgendaEvent[];
}

export default async function AgendaPage() {
  const items = await getData();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Agenda</h1>

      <div className="grid gap-3">
        {items.map((ev) => (
          <div key={ev.id} className="rounded-xl border border-neutral-800 p-3 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{ev.title}</div>
              <div className="text-xs opacity-70">
                {new Date(ev.when).toLocaleString()} • {ev.duration_min} min
                {ev.session_id ? ` • sesión ${ev.session_id}` : ""}
              </div>
            </div>
            <span className="text-xs rounded-full px-2 py-1 border border-neutral-700">
              {ev.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
