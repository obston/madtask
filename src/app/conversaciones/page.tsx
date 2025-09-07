import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";
import { getBaseUrl } from "@/lib/getBaseUrl";
import type { ConversationDetail, ConversationListItem } from "@/lib/types";

async function getList(search: string): Promise<ConversationListItem[]> {
  const base = await getBaseUrl();
  const url = `${base}/api/conversaciones${search ? `?q=${encodeURIComponent(search)}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar conversaciones");
  const json = await res.json();
  return json.items as ConversationListItem[];
}

async function getDetail(id: string): Promise<ConversationDetail> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/conversaciones/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el detalle");
  return res.json();
}

type Estado = "todas" | "abierta" | "pendiente" | "resuelta";

export default async function ConversacionesPage({
  searchParams,
}: {
  // Next 15: searchParams puede ser Promise
  searchParams?: Promise<{ q?: string; id?: string; estado?: Estado }>;
}) {
  const { q = "", id, estado = "todas" } = (await searchParams) || {};

  // Lista base + filtro de estado (mock)
  let items = await getList(q);
  if (estado !== "todas") items = items.filter((it) => it.estado === estado);

  // Precarga del detalle si hay id
  const detail = id ? await getDetail(id) : null;
  const hasDetail = Boolean(detail);

  return (
    <div className="h-[calc(100vh-64px)]">
      {/* Contenedor centrado con aire horizontal */}
      <div className="mx-auto max-w-[1400px] h-full px-6 lg:px-8">
        {/* 10 columnas a partir de lg → 30/70 */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full">
  
          {/* LISTA (30% cuando hay detalle) */}
          <div
            className={
              (hasDetail ? "lg:col-span-3" : "lg:col-span-10") +
              " col-span-1 rounded-xl border border-neutral-800 overflow-hidden"
            }
          >
            {/* ...tu header/búsqueda/filtros/lista tal cual... */}
            {/* (no cambio nada del contenido interno) */}
            {/* EJEMPLO rápido: */}
            <div className="p-3 border-b border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Conversaciones</h1>
              </div>
              <form action="/conversaciones" method="GET" className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por usuario, sesión o texto…"
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
                />
                <input type="hidden" name="estado" value={estado} />
                {id ? <input type="hidden" name="id" value={id} /> : null}
                <button className="px-4 py-2 rounded-lg border border-neutral-700">Buscar</button>
              </form>
              <div className="flex flex-wrap gap-2 text-sm">
                {(["todas", "abierta", "pendiente", "resuelta"] as Estado[]).map((e) => {
                  const isActive = e === estado;
                  return (
                    <Link
                      key={e}
                      href={{ pathname: "/conversaciones", query: { q, estado: e, ...(id ? { id } : {}) } }}
                      className={
                        "px-3 py-1 rounded-full border " +
                        (isActive ? "border-white" : "border-neutral-800 opacity-80")
                      }
                    >
                      {e}
                    </Link>
                  );
                })}
              </div>
            </div>
  
            <div className="divide-y divide-neutral-900">
              {items.map((it) => (
                <div key={it.session_id} className="px-3 py-3 flex items-center justify-between hover:bg-neutral-900/40">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{it.phone_or_user}</div>
                    <div className="text-xs opacity-70 line-clamp-1">{it.ultimo_mensaje}</div>
                  </div>
                  <Link
                    href={{ pathname: "/conversaciones", query: { q, estado, id: it.session_id } }}
                    className="text-sm underline"
                  >
                    Abrir
                  </Link>
                </div>
              ))}
              {items.length === 0 && <div className="p-6 text-sm opacity-70">Sin resultados.</div>}
            </div>
          </div>
  
          {/* CHAT (70% cuando hay detalle) */}
          {detail && (
            <div className="col-span-1 lg:col-span-7 rounded-xl border border-neutral-800 overflow-hidden">
              <ChatPanel initial={detail} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
}
