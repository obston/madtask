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

  