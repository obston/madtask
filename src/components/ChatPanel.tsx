"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ConversationDetail } from "@/lib/types";

type Props = { initial: ConversationDetail };

export default function ChatPanel({ initial }: Props) {
  const [data, setData] = useState<ConversationDetail>(initial);
  const [text, setText] = useState("");
  const [takingOver, setTakingOver] = useState(false);
  const id = useMemo(() => data.session_id, [data.session_id]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Polling suave cada 5s
  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/conversaciones/${id}`, { cache: "no-store" });
      if (res.ok) setData(await res.json());
    }, 5000);
    return () => clearInterval(t);
  }, [id]);

  // Auto-scroll al final cuando cambian los mensajes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [data.messages.length]);

  async function send() {
    const payload = text.trim();
    if (!payload) return;

    const optimistic = { role: "user" as const, text: payload, ts: new Date().toISOString() };
    setData((d) => ({ ...d, messages: [...d.messages, optimistic] }));
    setText("");

    const res = await fetch(`/api/conversaciones/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: payload, agent: "human" }),
    });
    if (!res.ok) {
      setData((d) => ({ ...d, messages: d.messages.filter((m) => m !== optimistic) }));
      alert("No se pudo enviar el mensaje");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (takingOver && text.trim()) send();
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-neutral-800 p-3">
        <div className="font-medium">Conversación {id}</div>
        <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="accent-white"
            checked={takingOver}
            onChange={(e) => setTakingOver(e.target.checked)}
          />
          Tomar control
        </label>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-3">
        {data.messages.map((m, i) => (
          <div
            key={i}
            className={
              "max-w-[80%] rounded-lg px-3 py-2 text-sm border " +
              (m.role === "user"
                ? "self-start bg-neutral-900 border-neutral-800"
                : "self-end bg-neutral-800 border-neutral-700")
            }
            style={{ alignSelf: m.role === "user" ? "flex-start" : "flex-end" }}
          >
            <div className="opacity-60 text-xs mb-1">
              {m.role} • {new Date(m.ts).toLocaleTimeString()}
            </div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-800 p-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown} // 👈 Enter para enviar (Shift+Enter = salto de línea)
          placeholder={takingOver ? "Escribe tu mensaje…" : "Activa 'Tomar control' para responder"}
          disabled={!takingOver}
          className="flex-1 resize-none rounded-lg border border-neutral-800 bg-neutral-900 p-2 outline-none disabled:opacity-60"
          rows={2}
        />
        <button
          onClick={send}
          disabled={!takingOver || !text.trim()}
          className="px-4 py-2 rounded-lg border border-neutral-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
