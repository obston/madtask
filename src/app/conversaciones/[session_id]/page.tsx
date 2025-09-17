import api from "@/lib/api";
import { ChatPanel } from "@/components/ChatPanel";

export const dynamic = "force-dynamic";

export default async function ConversacionPage({ params }: { params: { session_id: string } }) {
  const { session_id } = params;
  const limit = 500;

  const json = await api<{ ok: true; items: any[] }>(`/api/conversaciones/${session_id}?limit=${limit}`);
  return <ChatPanel sessionId={session_id} messages={json.items ?? []} />;
}

