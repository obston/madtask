import type { ConversationListItem } from "@/lib/types";
import Link from "next/link";

export default function ConversationsTable({ items }: { items: ConversationListItem[] }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-neutral-400">
            <th className="px-3 py-2">Session</th>
            <th className="px-3 py-2">Usuario</th>
            <th className="px-3 py-2">Último</th>
            <th className="px-3 py-2">Hora</th>
            <th className="px-3 py-2">#User</th>
            <th className="px-3 py-2">#Bot</th>
            <th className="px-3 py-2">Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.session_id} className="border-t border-neutral-800">
              <td className="px-3 py-2 font-mono text-xs">{c.session_id}</td>
              <td className="px-3 py-2">{c.phone_or_user}</td>
              <td className="px-3 py-2">{c.ultimo_mensaje}</td>
              <td className="px-3 py-2">{new Date(c.hora).toLocaleTimeString()}</td>
              <td className="px-3 py-2">{c.conteo_user}</td>
              <td className="px-3 py-2">{c.conteo_bot}</td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    c.estado === "resuelta"
                      ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/60"
                      : c.estado === "pendiente"
                      ? "bg-amber-900/40 text-amber-300 border border-amber-800/60"
                      : "bg-sky-900/40 text-sky-300 border border-sky-800/60"
                  }`}
                >
                  {c.estado}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <Link href={`/conversaciones/${c.session_id}`} className="underline">
                  Abrir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
