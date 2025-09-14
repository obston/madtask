// src/components/ChatPanel.tsx
"use client";

type Msg = { role: "user"|"assistant"|"system"; message: string|null; created_at: string };

export function ChatPanel({ sessionId, messages }: { sessionId: string; messages: Msg[] }) {
  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-3">
      <div className="text-sm opacity-70">Conversación {sessionId}</div>
      <div className="flex-1 space-y-3 overflow-auto rounded-lg border border-zinc-700 p-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] rounded-lg border p-3 ${m.role === "user" ? "ml-0 mr-auto border-zinc-700" : "ml-auto mr-0 border-zinc-600"}`}>
            <div className="text-[10px] opacity-60">{new Date(m.created_at).toISOString()} — {m.role}</div>
            <div className="whitespace-pre-wrap">{m.message ?? ""}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-700 p-3 opacity-60">
        Activa “Tomar control” para responder (pendiente de wiring con n8n)
      </div>
    </div>
  );
}
