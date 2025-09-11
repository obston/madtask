import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";
import type { ConversationListResponse, Estado } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ChatComposer from "@/components/ChatComposer";

const PAGE_SIZE = 20;

async function getList(params: {
  q: string;
  estado: Estado | "todas";
  page: number;
  limit: number;
}): Promise<ConversationListResponse> {
  const base = await getBaseUrl();
  const url = new URL(`${base}/api/conversaciones`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.estado) url.searchParams.set("estado", params.estado);
  url.searchParams.set("page", String(params.page));
  // acepta ambos: pageSize|limit
  url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar conversaciones");
  return res.json();
}

/** --------- HISTORIAL REAL DE MENSAJES ---------- */
type MensajeItem = {
  id: number;
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string; // ISO
};

type MensajesResponse = {
  session_id: string;
  items: MensajeItem[];
  nextCursor: string | null;
};

async function getMensajes(session_id: string, limit = 200): Promise<MensajesResponse> {
  const base = await getBaseUrl();
  const url = new URL(`${base}/api/mensajes`);
  url.searchParams.set("session_id", session_id);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar los mensajes");
  return res.json();
}
/** ---------------------------------------------- */

export default async function ConversacionesPage({
  searchParams,
}: {
  // Next 15: puede venir como Promise
  searchParams?: Promise<{ q?: string; id?: string; estado?: Estado | "todas"; page?: string }>;
}) {
  const { q = "", id, estado = "todas", page = "1" } = (await searchParams) || {};
  const pageNum = Math.max(1, parseInt(page || "1", 10));

  // Lista izquierda
  const list = await getList({ q, estado, page: pageNum, limit: PAGE_SIZE });

  // Fallback mientras no tenemos estados reales en el backend
  const counts = (list as any)?.counts ?? {
    abierta: list.total ?? 0,
    pendiente: 0,
    resuelta: 0,
  };
  const totalALL = (counts.abierta ?? 0) + (counts.pendiente ?? 0) + (counts.resuelta ?? 0);

  // Detalle derech0 (si hay ?id=)
  const hasDetail = Boolean(id);
  const activeItem = id ? list.items.find((x) => x.session_id === id) : undefined;
  const displayName = activeItem?.phone_or_user ?? (id ?? "");

  // Carga historial real si hay id
  let chat: MensajesResponse | null = null;
  if (id) {
    chat = await getMensajes(id);
  }

  // Helper para conservar query al navegar
  const buildQuery = (extra: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (estado) query.set("estado", estado);
    if (id) query.set("id", id);
    query.set("page", String(pageNum));
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== "") query.set(k, String(v));
    });
    return `/conversaciones?${query.toString()}`;
  };

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1400px] h-full px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full">
          {/* LISTA — 30% (cuando hay detalle) */}
          <div
            className={
              (hasDetail ? "lg:col-span-3" : "lg:col-span-10") +
              " col-span-1 rounded-xl border border-neutral-800 overflow-hidden flex flex-col"
            }
          >
            {/* Header + búsqueda + filtros */}
            <div className="p-3 border-b border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Conversaciones</h1>
              </div>

              {/* Búsqueda GET */}
              <form action="/conversaciones" method="GET" className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar por usuario, sesión o texto…"
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
                />
                {/* preserva estado/id al buscar */}
                <input type="hidden" name="estado" value={estado} />
                {id ? <input type="hidden" name="id" value={id} /> : null}
                <input type="hidden" name="page" value="1" />
                <button className="px-4 py-2 rounded-lg border border-neutral-700">Buscar</button>
              </form>

              {/* Contadores / filtros */}
              <div className="flex flex-wrap gap-2 text-sm">
                {([
                  { k: "todas", n: totalALL },
                  { k: "abierta", n: counts.abierta },
                  { k: "pendiente", n: counts.pendiente },
                  { k: "resuelta", n: counts.resuelta },
                ] as Array<{ k: Estado | "todas"; n: number }>).map(({ k, n }) => {
                  const isActive = k === estado;
                  const url = new URLSearchParams();
                  if (q) url.set("q", q);
                  url.set("estado", k);
                  // al cambiar filtro, resetea page a 1, conserva id si existe
                  url.set("page", "1");
                  if (id) url.set("id", id);
                  return (
                    <Link
                      key={k}
                      href={`/conversaciones?${url.toString()}`}
                      className={
                        "px-3 py-1 rounded-full border flex items-center gap-2 " +
                        (isActive ? "border-white" : "border-neutral-800 opacity-80")
                      }
                    >
                      <span>{k}</span>
                      <span className="text-xs opacity-70">({n})</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* items */}
            <div className="flex-1 overflow-auto divide-y divide-neutral-900">
              {list.items.map((it) => {
                const active = it.session_id === id;
                return (
                  <Link
                    key={it.session_id}
                    href={{
                      pathname: "/conversaciones",
                      query: { q, estado, page: pageNum, id: it.session_id },
                    }}
                    className={
                      "block px-3 py-3 hover:bg-neutral-900/40 " +
                      (active ? "bg-neutral-900/60 ring-1 ring-neutral-700" : "")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Izquierda */}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{it.phone_or_user}</div>
                        <div className="text-xs opacity-70 line-clamp-1">{it.ultimo_mensaje}</div>
                      </div>
                      {/* Derecha */}
                      <div className="w-28 shrink-0 text-right">
                        <div className="text-xs opacity-60 whitespace-nowrap">
                          {it.hora ? format(new Date(it.hora), "PPpp", { locale: es }) : "—"}
                        </div>
                        <div className="mt-1">
                          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border border-neutral-700">
                            {it.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {list.items.length === 0 && (
                <div className="p-6 text-sm opacity-70">Sin resultados.</div>
              )}
            </div>

            {/* Paginación */}
            <div className="p-3 border-t border-neutral-800 flex items-center justify-between">
              <div className="text-xs opacity-70">
                Página {list.page} de {list.pages} · {list.total} resultados
              </div>
              <div className="flex items-center gap-2">
                <Link
                  aria-disabled={list.page <= 1}
                  className={
                    "px-3 py-1 rounded border " +
                    (list.page <= 1
                      ? "border-neutral-900 opacity-40 pointer-events-none"
                      : "border-neutral-700")
                  }
                  href={buildQuery({ page: list.page - 1 })}
                >
                  Anterior
                </Link>
                <Link
                  aria-disabled={list.page >= list.pages}
                  className={
                    "px-3 py-1 rounded border " +
                    (list.page >= list.pages
                      ? "border-neutral-900 opacity-40 pointer-events-none"
                      : "border-neutral-700")
                  }
                  href={buildQuery({ page: list.page + 1 })}
                >
                  Siguiente
                </Link>
              </div>
            </div>
          </div>

          {/* CHAT — 70% (real) */}
          {id && chat && (
            <div className="col-span-1 lg:col-span-7 rounded-xl border border-neutral-800 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-3 border-b border-neutral-800">
                <div className="text-lg font-medium truncate">{displayName}</div>
                <div className="text-xs opacity-60">{id}</div>
              </div>

              {/* Historial */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {chat.items.length === 0 && (
                  <div className="opacity-60">Sin mensajes aún.</div>
                )}
                {chat.items.map((m) => (
                  <div key={m.id} className="rounded-xl bg-neutral-900 px-4 py-3">
                    <div className="text-xs opacity-60 mb-1">
                      {m.role} ·{" "}
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </div>
                    <div className="whitespace-pre-wrap">{m.message ?? "—"}</div>
                  </div>
                ))}
              </div>

              {/* Composer SIEMPRE activo: escribir = intervenir */}
              <ChatComposer
                sessionId={chat.session_id}
                onSent={async () => {
                  "use server";
                  // Si quieres refresco inmediato del panel sin recargar, dímelo y te paso la versión client con refetch.
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
