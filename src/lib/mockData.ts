import { ConversationDetail, ConversationListItem, Overview } from "./types";

export function overviewMock(): Overview {
  // 15 días hacia atrás, hoy incluido
  const days = 15;
  const today = new Date();
  today.setHours(0,0,0,0);

  const series_15d = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      chats: Math.max(5, Math.round(10 + 30 * Math.random())), // 5..40
    };
  });

  const conversaciones_hoy = series_15d[series_15d.length - 1].chats;

  const fallback_rate = 0.08 + Math.random() * 0.08; // ~8%..16%
  const avg_response_time = +(1.3 + Math.random() * 1.2).toFixed(1); // 1.3..2.5 s
  const pendientes_confirmar_memoria = Math.floor(2 + Math.random() * 6); // 2..7

  return {
    conversaciones_hoy,
    fallback_rate,
    avg_response_time,
    pendientes_confirmar_memoria,
    series_15d,
  };
}


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

