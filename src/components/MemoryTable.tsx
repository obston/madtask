"use client";
import { useEffect, useMemo, useState } from "react";
import type { MemoryItem, MemoryStatus } from "@/lib/types";

export default function MemoryTable() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<MemoryStatus | undefined>(undefined);
  const [rows, setRows] = useState<MemoryItem[]>([]);
  const [counts, setCounts] = useState<{[k in MemoryStatus | "all"]?: number}>({});

  const fetchData = async () => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    const res = await fetch(`/api/memoria?${p.toString()}`, { cache: "no-store" });
    const data = await res.json();
    setRows(data.items);
    setCounts(data.summary?.counts ?? {});
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [status]);

  const onApprove = async (id: string) => {
    await fetch(`/api/memoria/${id}`, { method: "PATCH", body: JSON.stringify({ status: "approved" })});
    fetchData();
  };
  const onArchive = async (id: string) => {
    await fetch(`/api/memoria/${id}`, { method: "PATCH", body: JSON.stringify({ status: "archived" })});
    fetchData();
  };
  const onForget = async (id: string) => {
    await fetch(`/api/memoria/${id}`, { method: "PATCH", body: JSON.stringify({ status: "forgotten" })});
    fetchData();
  };
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); fetchData(); };

  const tabs = [
    { key: undefined, label: `todas (${counts.all ?? 0})` },
    { key: "pending", label: `pendientes (${counts.pending ?? 0})` },
    { key: "approved", label: `aprobadas (${counts.approved ?? 0})` },
    { key: "archived", label: `archivadas (${counts.archived ?? 0})` },
    { key: "forgotten", label: `olvidadas (${counts.forgotten ?? 0})` },
  ] as const;

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex gap-2">
        <input
          value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Buscar en memoria…"
          className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2"
        />
        <button className="rounded-xl px-4 py-2 border border-neutral-600">Buscar</button>
        <button
          type="button"
          onClick={async ()=>{
            await fetch("/api/memoria?action=reprocess", { method:"PATCH" });
            fetchData();
          }}
          className="rounded-xl px-4 py-2 border border-neutral-600"
        >Reprocesar embeddings</button>
      </form>

      <div className="flex gap-2 text-sm">
        {tabs.map(t=>(
          <button
            key={String(t.key)}
            onClick={()=>setStatus(t.key as any)}
            className={`px-3 py-1 rounded-full border ${status===t.key ? "bg-neutral-800 border-neutral-500" : "border-neutral-700"}`}
          >{t.label}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Contenido</th>
              <th className="text-left px-4 py-2">Fuente</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t border-neutral-800">
                <td className="px-4 py-2 capitalize">{r.kind}</td>
                <td className="px-4 py-2">{r.text}</td>
                <td className="px-4 py-2">{r.source?.type}{r.source?.ref ? ` · ${r.source.ref}` : ""}</td>
                <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-end">
                    <button onClick={()=>onApprove(r.id)} className="px-2 py-1 rounded-lg border border-neutral-600">Aprobar</button>
                    <button onClick={()=>onArchive(r.id)} className="px-2 py-1 rounded-lg border border-neutral-600">Archivar</button>
                    <button onClick={()=>onForget(r.id)} className="px-2 py-1 rounded-lg border border-neutral-600">Olvidar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
