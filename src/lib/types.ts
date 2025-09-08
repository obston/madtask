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
export type ConversationListResponse = {
  items: ConversationListItem[];
  page: number;
  pages: number;
  total: number;
  counts: { abierta: number; pendiente: number; resuelta: number };
};

export type ConversationDetail = {
  session_id: string;
  messages: { role: "user" | "bot"; text: string; ts: string }[];
};

export type Overview = {
  conversaciones_hoy: number;
  fallback_rate: number;              // 0..1  (porcentaje en fracción)
  avg_response_time: number;          // segundos
  pendientes_confirmar_memoria: number;
  series_15d: { date: string; chats: number }[];
};

export type FeedKind = "fallback" | "moderation" | "error" | "human_takeover" | "normal";

export type FeedItem = {
  id: string;
  ts: string;                    // ISO
  type: FeedKind;
  session_id: string;
  role: "user" | "bot";
  text: string;
  severity?: 1 | 2 | 3;          // opcional
  resolved: boolean;             // para marcar como visto
};

export type FeedListResponse = {
  items: FeedItem[];
  total: number;
  page: number;
  limit: number;
  summary: {
    total: number;
    fallback: number;
    moderation: number;
    error: number;
    human_takeover: number;
    unresolved: number;
  };
};


export type AgendaEvent = {
  id: string;
  title: string;
  start_ts: string;       // ISO (timestamptz)
  end_ts: string;         // ISO (timestamptz)
  timezone: string;       // ej. "America/Mexico_City"
  session_id?: string;    // vínculo a conversación (opcional)
  status: "pending" | "confirmed" | "done" | "cancelled";
  source?: "internal" | "google";
  external_event_id?: string; // si viene de Google
  calendar_id?: string;       // id del calendario (si aplica)
};


  