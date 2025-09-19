"use client";
import useSWR from "swr";
import { useState, useMemo } from "react";
import Link from "next/link";
import DateTag from "@/components/DateTag";
import { SidebarSkeleton } from "./skeletons";

const fetcher = async (u: string) => {
    const r = await fetch(u);
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`HTTP ${r.status} ${r.statusText} – ${txt}`);
    }
    return r.json();
  };
  

export default function Sidebar({ selected }: { selected?: string }) {
  const [q, setQ] = useState("");
  const { data, isLoading } = useSWR(
    `/api/conversaciones?q=${encodeURIComponent(q)}`,
    fetcher,
    { refreshInterval: 10_000 }
  );

  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar conversación…"
          className="w-full rounded-lg px-3 py-2 bg-black/30 border border-white/10 outline-none"
        />
      </div>

      {isLoading ? (
        <SidebarSkeleton />
      ) : items.length === 0 ? (
        <div className="px-3 text-sm text-white/50">Sin conversaciones.</div>
      ) : (
        <ul className="overflow-y-auto">
          {items.map((it: any) => (
            <li key={it.session_id}>
              <Link
                href={`/conversaciones/${encodeURIComponent(it.session_id)}`}
                className={`block px-3 py-3 hover:bg-white/5 ${
                  selected === it.session_id ? "bg-white/5" : ""
                }`}
              >
                <div className="flex justify-between gap-2">
                  <div className="font-medium truncate">{it.session_id}</div>
                  <div className="text-xs text-white/50">
                    <DateTag value={it.last_at} variant="time" />
                  </div>
                </div>
                <div className="text-xs text-white/60 truncate">
                  {it.last_message}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
