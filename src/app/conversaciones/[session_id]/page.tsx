// src/app/conversaciones/[session_id]/page.tsx
import { ChatPanel } from "@/components/ChatPanel";
import { getBaseUrl } from "@/lib/getBaseUrl";

export default async function ConversacionPage(
  props: { params: Promise<{ session_id: string }> } // 👈 Promise
) {
  const { session_id } = await props.params;        // 👈 await
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/conversaciones/${session_id}?limit=500`, { cache: "no-store" });
  const json = await res.json();

  if (!json?.ok) return <div className="p-6">No se pudo cargar historial</div>;

  return <ChatPanel sessionId={session_id} messages={json.items ?? []} />;
}

