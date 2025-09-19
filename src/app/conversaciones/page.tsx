// src/app/conversaciones/page.tsx
import { redirect } from "next/navigation";
import { qOne } from "@/lib/db";
import { resolveClienteId } from "@/lib/tenant";

export default async function ConversacionesIndex() {
  const clienteId = await resolveClienteId(); // ahora opcional 
  const row = await qOne<{ session_id: string }>`
    SELECT session_id
    FROM public.n8n_chat_histories
    WHERE cliente_id = ${clienteId}
    GROUP BY session_id
    ORDER BY max(created_at) DESC
    LIMIT 1
  `;
  if (row?.session_id) {
    redirect(`/conversaciones/${encodeURIComponent(row.session_id)}`);
  }
  return (
    <div className="p-6">
      <div className="rounded-2xl border border-neutral-800/70 bg-neutral-900/40 p-6">
        <h2 className="text-lg font-semibold text-neutral-100 mb-2">
          Aún no hay conversaciones
        </h2>
        <p className="text-neutral-400">
          Cuando llegue el primer mensaje, aparecerá aquí automáticamente.
        </p>
      </div>
    </div>
  );
}
