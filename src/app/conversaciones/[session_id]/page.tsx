import { getBaseUrl } from "@/lib/getBaseUrl";
import ConversationSidebarShell from "@/components/ConversationSidebarShell";
import ChatPanel from "@/components/ChatPanel";
import clsx from "clsx";

type MsgRow = { role: "user"|"assistant"|"system"; message: string|null; created_at: string };
type Params = { session_id: string };

export default async function ConversacionPage(props: { params: Promise<Params> }) {
  const { session_id } = await props.params;                 // << clave
  const base = await getBaseUrl();

  const r = await fetch(`${base}/api/conversaciones/${encodeURIComponent(session_id)}`, { cache: "no-store" });
  const j = r.ok ? await r.json() : { rows: [] };
  const rows = (j.rows ?? []) as MsgRow[];

  return (
    <div className="h-[calc(100vh-96px)] flex gap-4">
      {/* Izquierda: Sidebar fijo con su propio scroll */}
      <div className="w-80 rounded-2xl border border-neutral-800/70 bg-neutral-900/40 flex flex-col">
        <ConversationSidebarShell active={session_id} />
      </div>

      {/* Derecha: Chat con header fijo, mensajes scrolleables y composer fijo */}
      <div className="flex-1 rounded-2xl border border-neutral-800/70 bg-neutral-900/40 flex flex-col">
        <ChatPanel sessionId={session_id} rows={rows} />
      </div>
    </div>
  );
}
