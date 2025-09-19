// src/components/ConversationSidebar.tsx
import Link from "next/link";
import { q } from "@/lib/db";
import { resolveClienteId } from "@/lib/tenant";
import { shortWhen } from "@/lib/date";
import clsx from "clsx";

type Row = {
  session_id: string;
  last_at: string;
  last_message: string | null;
  telefono_usuario: string | null;
};

export default async function ConversationSidebar({ active }: { active?: string }) {
  const clienteId = await resolveClienteId();

  const rows = await q<Row>`
    WITH last AS (
      SELECT DISTINCT ON (session_id)
        session_id,
        created_at AS last_at,
        message    AS last_message,
        telefono_usuario
      FROM public.n8n_chat_histories
      WHERE cliente_id = ${clienteId}
      ORDER BY session_id, created_at DESC
    )
    SELECT session_id, last_at::text, last_message, telefono_usuario
    FROM last
    ORDER BY last_at DESC
    LIMIT 100
  `;

  if (rows.length === 0) {
    return <div className="p-4 text-sm text-neutral-400">No hay conversaciones aún.</div>;
  }

  return (
    <div className="overflow-y-auto">
      <ul className="divide-y divide-neutral-800/70">
        {rows.map((r) => {
          const when = shortWhen(new Date(r.last_at));
          const title = r.telefono_usuario || r.session_id;
          const snippet = (r.last_message || "—").replace(/\s+/g, " ").trim();
          const isActive = active === r.session_id;

          return (
            <li key={r.session_id}>
              <Link
                href={`/conversaciones/${encodeURIComponent(r.session_id)}`}
                className={clsx("block px-3 py-3 hover:bg-neutral-900/70", isActive && "bg-neutral-900/70")}
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-neutral-100">{title}</span>
                      <span className="ml-auto shrink-0 text-xs text-neutral-400">{when}</span>
                    </div>
                    <div className="mt-0.5 truncate text-sm text-neutral-400">{snippet}</div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
