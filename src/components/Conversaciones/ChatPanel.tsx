"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import DateTag from "@/components/DateTag";
import { ChatSkeleton } from "./skeletons";

const fetcher = async (u: string) => {
  const r = await fetch(u);
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status} ${r.statusText} – ${txt}`);
  }
  return r.json();
};


type Msg = { id:number; role:"user"|"assistant"|"system"; message:string; created_at:string };

export default function ChatPanel({ sessionId }: { sessionId: string }) {
  const [cursorBefore, setCursorBefore] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");

  // Carga inicial + cursor (hacia atrás). Clave cambia con cursor.
  const key = `/api/conversaciones/${encodeURIComponent(sessionId)}${cursorBefore ? `?cursor_before=${encodeURIComponent(cursorBefore)}` : ""}`;
  const { data, isLoading, mutate } = useSWR(key, fetcher, {
    refreshInterval: 5000, // polling 5s
    revalidateOnFocus: true,
  });

  // Mensajes acumulados (mantenemos un buffer local)
  const [buffer, setBuffer] = useState<Msg[]>([]);
  const messages = useMemo<Msg[]>(
    () => {
      const fromApi = (data?.items ?? []) as Msg[];
      // Cuando se pagina hacia atrás, prepend
      if (cursorBefore) {
        // Evita duplicados por id
        const ids = new Set(fromApi.map(m => m.id));
        const rest = buffer.filter(m => !ids.has(m.id));
        return [...fromApi, ...rest];
      }
      // Inicial ó refresh normal: reemplaza con lo más reciente
      return fromApi.length ? fromApi : buffer;
    },
    [data, buffer, cursorBefore]
  );

  // Actualiza buffer al llegar nueva data sin cursorBefore
  useEffect(() => {
    if (data?.items && !cursorBefore) {
      setBuffer(data.items);
    }
  }, [data, cursorBefore]);

  // Auto-scroll inteligente
  const listRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    atBottomRef.current = nearBottom;

    // Paginación hacia arriba
    if (el.scrollTop < 60 && data?.nextCursorBefore) {
      const prevHeight = el.scrollHeight;
      setCursorBefore(data.nextCursorBefore);
      // Cuando cargue, conserva posición
      setTimeout(() => {
        if (!listRef.current) return;
        const newHeight = listRef.current.scrollHeight;
        listRef.current.scrollTop = newHeight - prevHeight;
      }, 0);
    }
  };

  // Enviar (optimistic UI)
  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);

    const optimistic: Msg = {
      id: Math.floor(Math.random() * 1e9) * -1, // id negativo temporal
      role: "assistant",
      message: t,
      created_at: new Date().toISOString(),
    };
    setBuffer((prev) => [...prev, optimistic]);
    setText("");

    try {
      const res = await fetch(`/api/conversaciones/${encodeURIComponent(sessionId)}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t }),
      });
      if (!res.ok) throw new Error(await res.text());
      const payload = await res.json();
      // Reemplaza el optimista por el real
      setBuffer((prev) =>
        prev.map((m) => (m.id === optimistic.id ? payload.item : m))
      );
      mutate(); // sincroniza
    } catch (e) {
      // Marca error en el bubble temporal
      setBuffer((prev) =>
        prev.map((m) =>
          m.id === optimistic.id ? { ...m, message: `${m.message}  (¡error al enviar!)` } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 text-sm">
        Conversación <span className="text-white/60">{sessionId}</span>
      </div>

      {isLoading && messages.length === 0 ? (
        <ChatSkeleton />
      ) : (
        <div
          ref={listRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {messages.length === 0 ? (
            <div className="text-sm text-white/60">Aún no hay mensajes.</div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`max-w-[70%] rounded-2xl px-3 py-2 ${m.role === "user" ? "bg-white/10 self-start" : "bg-white/5 self-end"} `}>
                <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                <div className="text-[10px] text-white/50 mt-1">
                  <DateTag value={m.created_at} variant="time" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Composer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Escribe un mensaje…"
            className="flex-1 resize-none rounded-lg px-3 py-2 bg-black/30 border border-white/10 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="px-4 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
