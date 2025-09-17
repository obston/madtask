// src/types.ts
export type Msg = {
    id: number;
    session_id?: string;
    role: "user" | "assistant" | "system";
    message: string | null;
    created_at: string; // ISO
  };
  
  export type MemItem = {
    id: number;
    tipo: "user" | "assistant" | "system" | "string";
    contenido: string;
    estado: "pending" | "approved" | "archived" | "forgotten";
    created_at: string; // ISO
  };
  
  export type ConversationListItem = {
    session_id: string;
    phone_or_user: string | null;
    ultimo_mensaje: string | null;
    created_at?: string;
  };
  