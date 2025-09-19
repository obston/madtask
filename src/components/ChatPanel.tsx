// src/components/ChatPanel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

type MsgRow = {
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string;
};

type Props = {
  sessionId: string;
  rows: MsgRow[]; // <<--- NUEVO
};

export default function ChatPanel({ sessionId, rows }: Props) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  // agrupa por fecha (YYYY-MM-DD) para separadores
  const groups = useMemo(() => {
    const acc: Record<string, MsgRow[]> = {};
    for (const m of rows) {
      const k = (m.created_at ?? "").slice(0, 10) || "desconocido";
      (acc[k] ||= []).push(m);
    }
    return acc;
  }, [rows]);

  const orderedDates = useMemo(
    () => Object.keys(groups).sort(),
    [groups]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [rows.length]);

  const onSend = async () => {
    const body = text.trim();
    if (!body) return;
    // TODO: pega tu POST real:
    // await fetch(`/api/conversaciones/${encodeURIComponent(sessionId)}/reply`, { method: "POST", body: JSON.stringify({ message: body }) })
    setText("");
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header fijo */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-800/70">
        <h3 className="text-sm font-semibold text-neutral-200">
          Conversación {sessionId}
        </h3>
      </div>

      {/* Mensajes (scrolleable) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {orderedDates.map((date) => (
          <div key={date} className="space-y-3">
            {/* separador fecha */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-800" />
              <div className="text-xs text-neutral-400">
                {new Date(date).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="h-px flex-1 bg-neutral-800" />
            </div>

            {/* burbujas */}
            <div className="flex flex-col gap-2">
              {groups[date].map((m, i) => {
                if (m.role === "system") return null;
                const isCustomer = m.role === "user"; // izquierda
                return (
                  <div
                    key={`${date}-${i}`}
                    className={clsx("max-w-[85%] md:max-w-[70%] rounded-2xl border px-3 py-2", {
                      "self-start bg-neutral-900/70 border-neutral-800/70":
                        isCustomer,
                      "self-end bg-neutral-800/50 border-neutral-700/60 ml-auto":
                        !isCustomer, // bot / agente
                    })}
                  >
                    <div className="text-xs text-neutral-400 mb-1">
                      {isCustomer ? "cliente" : "agente/bot"} ·{" "}
                      {m.created_at
                        ? new Date(m.created_at).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </div>
                    <div className="text-neutral-100 whitespace-pre-wrap">
                      {m.message ?? "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-sm text-neutral-400">
            Aún no hay mensajes. Escribe para tomar control.
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Composer fijo */}
      <div className="flex-shrink-0 border-t border-neutral-800/70">
        <div className="p-3 text-xs text-neutral-400 bg-neutral-900/20">
          Escribes como agente. Si dejas de escribir, el bot retomará.
        </div>
        <div className="p-4">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter salto de línea)"
              rows={1}
              className="flex-1 bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 resize-none min-h-[44px] max-h-32"
            />
            <button
              onClick={onSend}
              disabled={!text.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 disabled:bg-neutral-700 text-white text-sm"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
