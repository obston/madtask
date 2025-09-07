import { getBaseUrl } from "@/lib/getBaseUrl";
import type { FeedItem, FeedType } from "@/lib/types";
import Link from "next/link";

async function getData(q: string, type: string): Promise<FeedItem[]> {
  const base = await getBaseUrl();
  const url = `${base}/api/mensajes?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar mensajes");
  const json = await res.json();
  return json.items as FeedItem[];
}

type SParams = { q?: string; type?: FeedType | "all" };

export default async function MensajesPage({
  searchParams,
}: { searchParams?: Promise<SParams> }) {
  const { q = "", type = "all" } = (await searchParams) || {};
  const items = await getData(q, type);

  const types: Array<FeedType | "all"> = ["all", "message", "fallback", "error", "moderation"];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mensajes (feed)</h1>

      <form action="/mensajes" method="GET" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar en texto o por sesión…"
          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
        >
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="px-4 py-2 rounded-lg border border-neutral-700">Filtrar</button>
      </form>

      <div className="grid gap-2">
        {items.map((m) => (
          <div key={m.id} className="rounded-lg border border-neutral-800 p-3 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs opacity-70">
                {new Date(m.ts).toLocaleString()} • {m.type} • {m.role}
              </div>
              <div className="text-sm">{m.text}</div>
            </div>
            <Link href={`/conversaciones?id=${m.session_id}`} className="text-sm underline">
              Abrir hilo {m.session_id}
            </Link>
          </div>
        ))}
        {items.length === 0 && <div className="opacity-70 text-sm p-6">Sin resultados.</div>}
      </div>
    </div>
  );
}
