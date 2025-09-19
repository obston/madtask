"use client";
import { useMemo, useState } from "react";
// import { Search } from "lucide-react"; // ya instalado

type Row = {
  session_id: string;
  last_at: string;
  last_message: string | null;
  last_role: "user"|"assistant"|"system"|"agent" | null;
  telefono_usuario: string | null;
  last_user_message: string | null;
};

export default function ConversationSidebarClient({ initialRows, active }: { initialRows: Row[]; active?: string }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialRows;
    return initialRows.filter(r =>
      (r.telefono_usuario ?? "").toLowerCase().includes(s) ||
      (r.last_message ?? "").toLowerCase().includes(s) ||
      r.session_id.toLowerCase().includes(s)
    );
  }, [q, initialRows]);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* buscador sticky */}
      <div className="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60 border-b border-neutral-800/70 p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar conversación por número, usuario o mensaje…"
          className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-800/50 border border-neutral-700 placeholder-neutral-400"
        />
      </div>

      {/* lista */}
      <ul className="divide-y divide-neutral-800/70">
        {filtered.length === 0 && <li className="p-4 text-sm text-neutral-400">Sin resultados.</li>}
        {filtered.map((r) => (
          <li key={r.session_id}>
            <a
              href={`/conversaciones/${encodeURIComponent(r.session_id)}`}
              className={`block px-3 py-3 hover:bg-neutral-800/40 ${active === r.session_id ? "bg-neutral-800/50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-100 truncate">
                  {r.telefono_usuario ?? r.session_id}
                </span>
                <span className="text-xs text-neutral-400">{new Date(r.last_at).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" })}</span>
              </div>
              <div className="text-xs text-neutral-400 truncate">{r.last_message ?? "—"}</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
