import Link from "next/link";
import { getBaseUrl } from "@/lib/getBaseUrl";
import ResolveButton from "@/components/ResolveButton";
import BulkResolveButton from "@/components/BulkResolveButton";
import type { FeedListResponse, FeedKind } from "@/lib/types";

const PAGE_SIZE = 20;

async function getData(params: {
  q: string;
  type: FeedKind | "todas";
  resolved?: "true" | "false";
  page: number;
  limit: number;
}): Promise<FeedListResponse> {
  const base = await getBaseUrl();
  const url = new URL(`${base}/api/mensajes`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.type) url.searchParams.set("type", params.type);
  if (params.resolved) url.searchParams.set("resolved", params.resolved);
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("limit", String(params.limit));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar los mensajes");
  return res.json();
}

// etiquetas “cliente-friendly”
const labelByType: Record<FeedKind | "todas", string> = {
  todas: "todas",
  fallback: "sin respuesta",
  moderation: "moderación",
  error: "error",
  human_takeover: "requiere atención",
  normal: "actividad",
};

// fecha “tipo WhatsApp”
function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const yday = new Date(now);
  yday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yday.getFullYear() &&
    d.getMonth() === yday.getMonth() &&
    d.getDate() === yday.getDate();
  if (isYesterday) return `ayer ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const diffDays = Math.floor(
    (new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000
  );
  if (diffDays < 7) {
    const dow = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][d.getDay()];
    return `${dow} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const q = sp.q ?? "";
  const type = (sp.type as FeedKind | "todas") ?? "todas";
  const resolved = sp.resolved as "true" | "false" | undefined;
  const page = Math.max(1, parseInt(sp.page || "1", 10));

  const data = await getData({ q, type, resolved, page, limit: PAGE_SIZE });

  function buildQuery(extra: Record<string, string | undefined>) {
    const qp = new URLSearchParams();
    if (q) qp.set("q", q);
    if (type) qp.set("type", type);
    if (resolved) qp.set("resolved", resolved);
    qp.set("page", String(page));
    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined) return;
      qp.set(k, v);
    });
    return qp.toString();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mensajes</h1>

      {/* Búsqueda + bulk */}
      <div className="flex items-center gap-2">
        <form className="flex-1 flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por texto o sesión…"
            className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
          />
          <button className="px-3 py-2 rounded border border-neutral-800">Buscar</button>
        </form>
        {/* Marcar todos (según filtros actuales) */}
        <BulkResolveButton
          q={q}
          type={type}
          resolved={resolved}
          disabled={data.summary.unresolved === 0}
        />
      </div>

      {/* Filtros (etiquetas amigables) */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          ["todas", data.summary.total],
          ["fallback", data.summary.fallback],
          ["moderation", data.summary.moderation],
          ["error", data.summary.error],
          ["human_takeover", data.summary.human_takeover],
        ] as Array<[FeedKind | "todas", number]>).map(([k, n]) => (
          <Link
            key={k}
            href={`/mensajes?${buildQuery({ type: k, page: "1" })}`}
            className={
              "text-xs px-2 py-1 rounded-full border " +
              (type === k ? "border-white" : "border-neutral-800")
            }
          >
            {labelByType[k]} ({n})
          </Link>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/mensajes?${buildQuery({ resolved: undefined, page: "1" })}`}
            className={
              "text-xs px-2 py-1 rounded-full border " +
              (!resolved ? "border-white" : "border-neutral-800")
            }
          >
            todos
          </Link>
          <Link
            href={`/mensajes?${buildQuery({ resolved: "false", page: "1" })}`}
            className={
              "text-xs px-2 py-1 rounded-full border " +
              (resolved === "false" ? "border-white" : "border-neutral-800")
            }
          >
            sin resolver ({data.summary.unresolved})
          </Link>
          <Link
            href={`/mensajes?${buildQuery({ resolved: "true", page: "1" })}`}
            className={
              "text-xs px-2 py-1 rounded-full border " +
              (resolved === "true" ? "border-white" : "border-neutral-800")
            }
          >
            resueltos
          </Link>
        </div>
      </div>

      {/* Lista más limpia */}
      <div className="rounded-xl border border-neutral-800 divide-y divide-neutral-900 overflow-hidden">
        {data.items.map((m) => (
          <div key={m.id} className="p-3 flex items-start gap-4">
            {/* tiempo compacto */}
            <div className="w-28 shrink-0 text-xs opacity-70 text-right">
              {formatWhen(m.ts)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <span className="font-medium">{m.role}</span>{" "}
                <span className="opacity-80">{m.text}</span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs opacity-70">
                <span>
                  sesión:{" "}
                  <Link
                    href={`/conversaciones?id=${encodeURIComponent(m.session_id)}`}
                    className="underline"
                  >
                    {m.session_id}
                  </Link>
                </span>
                <span
                  className="ml-2 inline-flex items-center rounded-full border border-neutral-800 px-2 py-[2px] text-[11px] opacity-90"
                  title={m.type}
                >
                  {labelByType[m.type]}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <ResolveButton id={m.id} resolved={m.resolved} />
            </div>
          </div>
        ))}

        {data.items.length === 0 && (
          <div className="p-6 text-sm opacity-70">Sin mensajes.</div>
        )}
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm opacity-70">
        <div> Página {data.page} · {data.total} resultados </div>
        <div className="flex items-center gap-2">
          <Link
            className={"px-3 py-2 rounded border border-neutral-800 " + (page <= 1 ? "pointer-events-none opacity-40" : "")}
            href={`/mensajes?${buildQuery({ page: String(page - 1) })}`}
          >
            Anterior
          </Link>
          <Link
            className={
              "px-3 py-2 rounded border border-neutral-800 " +
              (page * PAGE_SIZE >= data.total ? "pointer-events-none opacity-40" : "")
            }
            href={`/mensajes?${buildQuery({ page: String(page + 1) })}`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}
