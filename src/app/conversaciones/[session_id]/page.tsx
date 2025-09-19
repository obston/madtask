// src/app/conversaciones/[session_id]/page.tsx
import Sidebar from "@/components/Conversaciones/Sidebar";
import ChatPanel from "@/components/Conversaciones/ChatPanel";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id } = await params;

  return (
    <div className="flex h-full">
      <div className="w-[32%] border-r border-white/10">
        <Sidebar selected={session_id} />
      </div>
      <div className="flex-1">
        <ChatPanel sessionId={session_id} />
      </div>
    </div>
  );
}
