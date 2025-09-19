// src/app/conversaciones/page.tsx
import Sidebar from "@/components/Conversaciones/Sidebar";

export const dynamic = "force-dynamic";

export default async function ConversacionesIndex() {
  return (
    <div className="flex h-full">
      <div className="w-[32%] border-r border-white/10">
        <Sidebar />
      </div>
      <div className="flex-1 grid place-items-center text-sm text-white/60">
        Selecciona una conversación
      </div>
    </div>
  );
}
