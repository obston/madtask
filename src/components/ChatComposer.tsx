"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type Props = {
  /** session_id = "<api_key_publica>_chat" */
  sessionId: string;
  /** se llamará después de enviar para refrescar el historial */
  onSent?: () => Promise<void> | void;
};

export default function ChatComposer({ sessionId, onSent }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // api_key_publica = session_id sin el sufijo "_chat"
  const apiKeyPublica = useMemo(
    () => sessionId.replace(/_chat$/, ""),
    [sessionId]
  );

  const send = useCallback(async () => {
    const mensaje = text.trim();
    if (!mensaje || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ api_key_publica: apiKeyPublica, mensaje }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Error HTTP ${res.status}`);
      }

      // limpia input y refresca historial
      setText("");
      if (typeof onSent === "function") await onSent();
      // focus de vuelta
      taRef.current?.focus();
    } catch (e) {
      console.error("[composer] send error:", e);
      // opcional: muestra toast
      alert("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }, [text, sending, apiKeyPublica, onSent]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t border-neutral-800">
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Escribe para intervenir…"
        className="flex-1 resize-none rounded-xl bg-neutral-900 px-3 py-2 outline-none ring-0 focus:ring-2 focus:ring-neutral-700"
        rows={2}
        disabled={sending}
      />
      <button
        onClick={() => void send()}
        disabled={sending || !text.trim()}
        className="rounded-xl px-4 py-2 bg-neutral-100 text-black disabled:opacity-40"
      >
        {sending ? "Enviando…" : "Enviar"}
      </button>
    </div>
  );
}
