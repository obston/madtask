// src/components/ConversationList.tsx
"use client";
import Link from "next/link";

type Item = {
  session_id: string;
  phone_or_user: string;
  ultimo_mensaje: string;
  hora: string;  // ISO
  estado: "abierta" | "pendiente" | "resuelta" | "todas";
};

export default function ConversationList ({ items, active }: { items: Item[]; active?: string }) {
  return (
    <div className="w-full space-y-2">
      {items.map(it => (
        <Link
          key={it.session_id}
          href={`/conversaciones/${it.session_id}`}
          className={`block rounded-lg border p-3 hover:bg-zinc-900/40 ${active === it.session_id ? "border-zinc-400" : "border-zinc-700"}`}
        >
          <div className="text-sm font-medium">{it.phone_or_user}</div>
          <div className="text-xs opacity-70 truncate">{it.ultimo_mensaje}</div>
          <div className="text-[10px] opacity-50">{new Date(it.hora).toISOString()}</div>
        </Link>
      ))}
    </div>
  );
}
