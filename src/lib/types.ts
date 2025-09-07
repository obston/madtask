export type Estado = "abierta" | "pendiente" | "resuelta";

export type ConversationListItem = {
  session_id: string;
  phone_or_user: string;
  ultimo_mensaje: string;
  hora: string;         // ISO
  conteo_user: number;
  conteo_bot: number;
  estado: Estado;
};

export type ConversationDetail = {
  session_id: string;
  messages: { role: "user" | "bot"; text: string; ts: string }[];
};

export type Overview = {
  conversaciones_hoy: number;
  fallback_rate: number;       // 0..1
  avg_response_time: number;   // segundos
  pendientes_embedding: number;
  series_7d: { date: string; chats: number }[];
};
export type FeedType = "message" | "fallback" | "error" | "moderation";

export type FeedItem = {
  id: string;
  ts: string;              // ISO
  session_id: string;
  type: FeedType;
  role: "user" | "bot";
  text: string;
};

export type AgendaEvent = {
  id: string;
  title: string;
  when: string;            // ISO start
  duration_min: number;
  session_id?: string;     // opcional, cita ligada a un chat
  status: "pending" | "confirmed" | "done" | "cancelled";
};

  