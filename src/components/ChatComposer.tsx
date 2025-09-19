// src/components/ChatComposer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatComposer({ sessionId }: { sessionId: string }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cuando el usuario escribe → tomar control; si deja de escribir 5s → soltar
  useEffect(() => {
    if (text.trim().length > 0) {
      setTakingOver(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTakingOver(false), 5000);
    } else {
      setTakingOver(false);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text]);

  async function onSend() {
    const payload = text.trim();
    if (!payload || sending) return;
    setSending(true);
    try {
      await fetch(`/api/conversaciones/${encodeURIComponent(sessionId)}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: payload }),
      });
      setText("");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t border-neutral-800/70 p-2 md:p-3">
      <div className="mb-1 text-xs text-neutral-400">
        {takingOver ? "Tomaste control: los mensajes irán como agente." :
          "Escribe para tomar control. Si dejas de escribir, el bot retomará."}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter salto de línea)"
          className="min-h-[44px] max-h-40 flex-1 rounded-xl bg-neutral-900/60 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-700"
        />
        <button
          disabled={sending || text.trim().length === 0}
          onClick={onSend}
          className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50 hover:bg-neutral-800"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
