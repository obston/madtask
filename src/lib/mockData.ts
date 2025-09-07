import { ConversationDetail, ConversationListItem, Overview } from "./types";

export const overviewMock: Overview = {
  conversaciones_hoy: 42,
  fallback_rate: 0.11,
  avg_response_time: 1.8,
  pendientes_embedding: 3,
  series_7d: [
    { date: "2025-09-01", chats: 36 },
    { date: "2025-09-02", chats: 12 },
    { date: "2025-09-03", chats: 45 },
    { date: "2025-09-04", chats: 34 },
    { date: "2025-09-05", chats: 33 },
    { date: "2025-09-06", chats: 41 },
    { date: "2025-09-07", chats: 15 },
  ],
};

const baseItems: ConversationListItem[] = Array.from({ length: 20 }).map((_, i) => {
  const id = `s-${(i + 1).toString().padStart(4, "0")}`;
  return {
    session_id: id,
    phone_or_user: i % 2 === 0 ? `+52 33 5555 00${i}` : `user_${i}`,
    ultimo_mensaje: i % 3 === 0 ? "¿Costo de envío?" : "Gracias!",
    hora: new Date(Date.now() - i * 3600_000).toISOString(),
    conteo_user: 3 + (i % 4),
    conteo_bot: 3 + ((i + 2) % 5),
    estado: (["abierta", "pendiente", "resuelta"] as const)[i % 3],
  };
});

export function mockConversationList(q?: string): ConversationListItem[] {
  const needle = (q ?? "").trim().toLowerCase();
  if (!needle) return baseItems;
  return baseItems.filter(
    (it) =>
      it.session_id.toLowerCase().includes(needle) ||
      it.phone_or_user.toLowerCase().includes(needle) ||
      it.ultimo_mensaje.toLowerCase().includes(needle)
  );
}

export function mockConversationDetail(session_id: string): ConversationDetail | null {
  const exists = baseItems.some((x) => x.session_id === session_id);
  if (!exists) return null;

  const now = Date.now();
  const msgs: ConversationDetail["messages"] = Array.from({ length: 10 }).map((_, i) => ({
    role: i % 2 === 0 ? "user" : "bot",
    text:
      i % 2 === 0
        ? `Mensaje del usuario #${i / 2 + 1}`
        : `Respuesta del bot #${Math.ceil(i / 2)}`,
    ts: new Date(now - (10 - i) * 5 * 60_000).toISOString(),
  }));

  return { session_id, messages: msgs };
}
import type { FeedItem, AgendaEvent } from "./types";

// ---- Mensajes (feed) ----
export function mockFeed(q?: string, type?: string): FeedItem[] {
  const base: FeedItem[] = Array.from({ length: 24 }).map((_, i) => ({
    id: `m-${i + 1}`,
    ts: new Date(Date.now() - i * 15 * 60_000).toISOString(),
    session_id: `s-${String((i % 12) + 1).padStart(4, "0")}`,
    type: (["message", "fallback", "error", "moderation"] as const)[i % 4],
    role: i % 2 === 0 ? "user" : "bot",
    text:
      i % 4 === 1
        ? "Fallback del bot: no entendí la intención"
        : i % 4 === 2
        ? "Error de proveedor LLM"
        : i % 4 === 3
        ? "Mensaje en revisión por moderación"
        : `Mensaje normal #${i + 1}`,
  }));
  let out = base;
  if (type && type !== "all") out = out.filter((x) => x.type === type);
  const needle = (q ?? "").toLowerCase().trim();
  if (needle) out = out.filter((x) => x.text.toLowerCase().includes(needle) || x.session_id.includes(needle));
  return out;
}

// ---- Agenda (citas/eventos) ----
export function mockAgenda(): AgendaEvent[] {
  const start = new Date();
  start.setHours(9, 0, 0, 0);
  const slots = [0, 60, 120, 180, 240, 300, 360];
  return slots.map((m, i) => ({
    id: `a-${i + 1}`,
    title: i % 3 === 0 ? "Cita de soporte" : i % 3 === 1 ? "Demo de producto" : "Seguimiento",
    when: new Date(start.getTime() + m * 60_000).toISOString(),
    duration_min: 30,
    session_id: `s-${String((i % 10) + 1).padStart(4, "0")}`,
    status: (["pending", "confirmed", "done"] as const)[i % 3],
  }));
}
