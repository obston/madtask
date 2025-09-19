import { q } from "@/lib/db";
import { resolveClienteId } from "@/lib/tenant";
import ConversationSidebarClient from "@/components/ConversationSidebarClient";

type Row = {
  session_id: string;
  last_at: string;
  last_message: string | null;
  last_role: "user"|"assistant"|"system"|"agent" | null;
  telefono_usuario: string | null;
  last_user_message: string | null;
};

export default async function ConversationSidebarShell({ active }: { active?: string }) {
  const clienteId = await resolveClienteId();
  const rows = await q<Row>`
    WITH last_any AS (
      SELECT DISTINCT ON (session_id)
        session_id, created_at AS last_at, message AS last_message, role AS last_role, telefono_usuario
      FROM public.n8n_chat_histories
      WHERE cliente_id = ${clienteId}
      ORDER BY session_id, created_at DESC
    )
    SELECT * FROM last_any
    ORDER BY last_at DESC
    LIMIT 200
  `;

  return <ConversationSidebarClient initialRows={rows} active={active} />;
}
