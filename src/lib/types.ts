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
// ---- MEMORIA ----
export type MemoryStatus = "pending" | "approved" | "archived" | "forgotten";
export type MemoryKind = "fact" | "summary" | "doc";

export interface MemoryItem {
  id: string;
  kind: MemoryKind;
  text: string;
  source?: { type: "conversation" | "manual" | "import"; ref?: string };
  created_at: string;   // ISO
  status: MemoryStatus;
}

// ---- ADMIN ----
export interface AdminChannels {
  whatsapp_numbers: { id: string; label: string; state: "connected" | "disconnected" }[];
  fb_app?: { app_id?: string; webhook_url?: string };
  email?: { inbound_address?: string };
  webchat?: { enabled: boolean };
}

export interface AdminVoice {
  provider: "none" | "twilio" | "vonage" | "net2phone";
  stt: "whisper" | "deepgram" | "none";
  tts: "azure" | "elevenlabs" | "none";
  transfer_number?: string;
}

export interface AdminSecurity {
  roles: { key: "owner" | "admin" | "agent" | "viewer"; name: string; perms: string[] }[];
  audit_log_enabled: boolean;
}

export interface AdminBotConfig {
  allow_files: boolean;
  allow_images: boolean;
  policies?: string;
  system_prompt?: string;
}

export interface AdminSettings {
  channels: AdminChannels;
  voice: AdminVoice;
  security: AdminSecurity;
  bot: AdminBotConfig;
  
}

export interface KpiPendientesRow {
  pendientes: number; // SELECT COUNT(*)::int AS pendientes
}

// Fila mínima para SELECT role, message, created_at
export interface UltimoMensajeRow {
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string;
}






  // Fila mínima para SELECT role, message, created_at
export interface UltimoMensajeRow {
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string;
}



// KPIs pendientes
export interface KpiPendientesRow {
  pendientes: number; // SELECT COUNT(*)::int AS pendientes
}



  // --- Para /api/mensajes y /api/overview (últimos mensajes) ---
export interface UltimoMensajeRow {
  id: number;
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string;
}

// --- Ítems del feed que muestra el Overview ---
export type OverviewFeedItem = {
  id: number;
  role: "user" | "assistant" | "system";
  message: string | null;
  created_at: string;
};

// --- Respuesta del API de overview del dashboard ---
export type ApiOverview =
  | { ok: true; kpis: { pendientes_embeddings: number }; feed: OverviewFeedItem[] }
  | { error: string };
