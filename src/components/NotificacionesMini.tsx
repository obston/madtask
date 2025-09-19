// src/components/NotificacionesMini.tsx
import { getBaseUrl } from "@/lib/getBaseUrl";
import Link from "next/link";

type Row = {
  role?: "user" | "assistant" | "system" | string;
  message?: string | null;
  created_at?: string | null;
  phone_or_user?: string | null;
  estado?: string | null;
  session_id?: string | null;
};

async function fetchNotifs(): Promise<Row[]> {
  try {
    const base = await getBaseUrl();
    const r = await fetch(`${base}/api/mensajes?limit=5`, { cache: "no-store" });
    const j = r.ok ? await r.json() : null;
    const arr = Array.isArray(j) ? j : j?.rows ?? j?.items ?? [];
    // normaliza a Row[]
    return (arr as any[]).map((x) => ({
      role: x.role ?? x.tipo ?? "user",
      message: x.message ?? x.text ?? x.contenido ?? "",
      created_at: x.created_at ?? x.ts ?? null,
      phone_or_user: x.phone_or_user ?? x.user ?? null,
      estado: x.estado ?? null,
      session_id: x.session_id ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function NotificacionesMini() {
  const rows = await fetchNotifs();

  return (
    <div className="rounded-2xl border border-neutral-800/70 bg-neutral-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">Notificaciones recientes</h3>
        <Link
          href="/mensajes"
          className="text-xs text-neutral-300 hover:text-white underline underline-offset-4"
        >
          Ver todas
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-neutral-400">
          No hay notificaciones por ahora. <span className="opacity-70">Todo en orden ✨</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.slice(0, 5).map((r, i) => (
            <li
              key={`${r.session_id ?? ""}-${i}`}
              className="rounded-xl bg-neutral-900/60 border border-neutral-800/70 p-3"
            >
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex items-center rounded px-1.5 py-0.5 border border-neutral-700">
                  {r.role === "assistant" ? "bot" : (r.role ?? "user")}
                </span>
                {r.estado && <span className="opacity-70">• {r.estado}</span>}
                {r.created_at && (
                  <span className="ml-auto tabular-nums">{new Date(r.created_at).toLocaleString()}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-200 line-clamp-2">
                {r.message || "—"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
