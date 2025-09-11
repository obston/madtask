import { getBaseUrl } from "@/lib/getBaseUrl";
import MiniChart15d from "@/components/MiniChart15d";
import Link from "next/link";
import type { Overview } from "@/lib/types";
import type { AgendaEvent, FeedItem } from "@/lib/types";
import { startOfWeek, endOfWeek } from "date-fns";


// Helpers de fetch (server)
async function getOverview(): Promise<Overview> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/overview`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar overview");
  return res.json();
}
async function getAgenda(): Promise<AgendaEvent[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/agenda`, { cache: "no-store" });
  const json = await res.json();
  return json.items as AgendaEvent[];
}
async function getMensajes(): Promise<FeedItem[]> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/mensajes?type=message`, { cache: "no-store" });
  const json = await res.json();
  return json.items as FeedItem[];
}

// Semana actual (lun-dom)


export default async function OverviewPage() {
  const [ov, agenda, feed] = await Promise.all([getOverview(), getAgenda(), getMensajes()]);

  // Agenda de la semana actual
  
  const s = startOfWeek(new Date(), { weekStartsOn: 1 });
  const e = endOfWeek(new Date(),   { weekStartsOn: 1 });
  
  const agendaWeek = agenda.filter((ev) => {
    const t = new Date(ev.start_ts).getTime(); // usar start_ts
    return t >= s.getTime() && t <= e.getTime();
  });
  

  // Últimos 5 mensajes “message”
  const feedArr = Array.isArray(data?.feed) ? data!.feed : [];
const latest = feedArr.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 p-4">
          <div className="text-sm opacity-70">Conversaciones hoy</div>
          <div className="text-2xl font-semibold mt-1">{ov.conversaciones_hoy}</div>
        </div>
        <div className="rounded-xl border border-neutral-800 p-4">
          <div className="text-sm opacity-70">Fallback rate</div>
          <div className="text-2xl font-semibold mt-1">{(ov.fallback_rate * 100).toFixed(1)}%</div>
          <div className="text-xs opacity-60 mt-1">% de turnos del usuario que dispararon fallback</div>
        </div>
        <div className="rounded-xl border border-neutral-800 p-4">
          <div className="text-sm opacity-70">Avg response time</div>
          <div className="text-2xl font-semibold mt-1">{ov.avg_response_time} s</div>
        </div>
        <div className="rounded-xl border border-neutral-800 p-4">
          <div className="text-sm opacity-70">Pendientes de confirmar memoria</div>
          <div className="text-2xl font-semibold mt-1">{ov.pendientes_confirmar_memoria}</div>
        </div>
      </div>

      {/* Gráfica 15 días */}
      <div className="rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Actividad últimos 15 días</div>
        </div>
        <MiniChart15d data={ov.series_15d} />
      </div>

      {/* Previews: Agenda + Últimos mensajes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agenda semana */}
        <div className="rounded-xl border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Agenda (semana actual)</div>
            <Link href="/agenda" className="text-sm underline">Ver agenda</Link>
          </div>
          {agendaWeek.length === 0 ? (
            <div className="opacity-70 text-sm">Sin eventos esta semana.</div>
          ) : (
            <div className="space-y-2">
              {agendaWeek.slice(0, 6).map(ev => (
                <div key={ev.id} className="text-sm flex items-center justify-between rounded border border-neutral-800 px-3 py-2">
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-xs opacity-70">
  {new Date(ev.start_ts).toLocaleString()} •
  {" "}
  {Math.round((new Date(ev.end_ts).getTime() - new Date(ev.start_ts).getTime()) / 60000)} min
</div>
                  </div>
                  <span className="text-xs rounded-full px-2 py-1 border border-neutral-700">{ev.status}</span>
                </div>
              ))}
              {agendaWeek.length > 6 && (
                <div className="text-xs opacity-70">+{agendaWeek.length - 6} más…</div>
              )}
            </div>
          )}
        </div>

        {/* Últimos mensajes */}
        <div className="rounded-xl border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Últimos mensajes</div>
            <Link href="/mensajes" className="text-sm underline">Ver todos</Link>
          </div>
          {latest.length === 0 ? (
            <div className="opacity-70 text-sm">Sin mensajes aún.</div>
          ) : (
            <div className="space-y-2">
              {latest.map(m => (
                <div key={m.id} className="text-sm flex items-center justify-between rounded border border-neutral-800 px-3 py-2">
                  <div className="pr-3">
                    <div className="text-xs opacity-70">{new Date(m.ts).toLocaleString()} • {m.role}</div>
                    <div className="line-clamp-1">{m.text}</div>
                  </div>
                  <Link href={`/conversaciones?id=${m.session_id}`} className="text-xs underline whitespace-nowrap">
                    Abrir {m.session_id}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

