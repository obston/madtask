// src/app/conversaciones/page.tsx
import { ConversationList } from "@/components/ConversationList"; 
import { ChatPanel } from "@/components/ChatPanel";
import { getBaseUrl } from "@/lib/getBaseUrl";
import type { ConversationListItem } from "@/lib/types";

export default async function ConversacionesPage({ searchParams }: { searchParams?: { q?: string; page?: string } }) {
  const base = await getBaseUrl();
  const q = encodeURIComponent(searchParams?.q ?? "");
  const page = parseInt(searchParams?.page ?? "1", 10);

  const [listRes, chatRes] = await Promise.all([
    fetch(`${base}/api/conversaciones?q=${q}&page=${page}&pageSize=20`, { cache: "no-store" }),
    fetch(`${base}/api/mensajes?type=message&limit=20`, { cache: "no-store" }), // opcional “últimos” si no hay selección
  ]);

  const listJson = await listRes.json();
  const items: ConversationListItem[] = listJson?.items ?? [];

  // si hay al menos una sesión, abrimos la primera a la derecha como preview
  let preview: any[] = [];
  if (items[0]?.session_id) {
    const r = await fetch(`${base}/api/conversaciones/${items[0].session_id}?limit=200`, { cache: "no-store" });
    const j = await r.json();
    preview = j?.items ?? [];
  }

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <div className="col-span-4">
        <ConversationList items={items as any} active={items[0]?.session_id} />
      </div>
      <div className="col-span-8">
        {items[0]?.session_id ? (
          <ChatPanel sessionId={items[0].session_id} messages={preview} />
        ) : (
          <div className="rounded-lg border border-zinc-700 p-6">No hay conversaciones</div>
        )}
      </div>
    </div>
  );
}
