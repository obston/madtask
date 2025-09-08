// src/lib/mockStore.ts
import { addMinutes } from "date-fns";
import type { AgendaEvent, FeedItem, FeedKind, FeedListResponse } from "./types";
import type { ConversationDetail } from "./types";

// ---- Agenda (in-memory) ----
const tz = "America/Mexico_City";
let _agendaSeeded = false;
let agendaEvents: AgendaEvent[] = [];

function startOfWeek(d = new Date()) {
  const s = new Date(d);
  const day = (s.getDay() + 6) % 7; // lunes=0
  s.setDate(s.getDate() - day);
  s.setHours(0, 0, 0, 0);
  return s;
}

function seedAgendaIfNeeded() {
  if (_agendaSeeded) return;
  _agendaSeeded = true;

  const base = new Date();
  const weekStart = startOfWeek(base); // lunes
  const slots = [
    { dayOffset: 0, hour: 9,  dur: 30, title: "Cita de soporte" },
    { dayOffset: 1, hour: 11, dur: 30, title: "Demo de producto" },
    { dayOffset: 2, hour: 14, dur: 30, title: "Seguimiento" },
    { dayOffset: 3, hour: 16, dur: 30, title: "Llamada comercial" },
    { dayOffset: 4, hour: 10, dur: 30, title: "Onboarding" },
  ];

  agendaEvents = slots.map((s, i) => {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() + s.dayOffset);
    start.setHours(s.hour, 0, 0, 0);
    const end = addMinutes(start, s.dur);
    return {
      id: `a-${i + 1}`,
      title: s.title,
      start_ts: start.toISOString(),
      end_ts: end.toISOString(),
      timezone: tz,
      session_id: `s-${String((i % 10) + 1).padStart(4, "0")}`,
      status: (["pending", "confirmed", "done"] as const)[i % 3],
      source: "internal",
    };
  });
}

export function getAgendaRange(fromISO: string, toISO: string): AgendaEvent[] {
  seedAgendaIfNeeded();
  const from = new Date(fromISO).getTime();
  const to = new Date(toISO).getTime();
  return agendaEvents
    .filter((ev) => {
      const a = new Date(ev.start_ts).getTime();
      const b = new Date(ev.end_ts).getTime();
      // solapa dentro del rango
      return a <= to && b >= from;
    })
    .sort((a, b) => (a.start_ts < b.start_ts ? -1 : 1));
}

export function createAgendaEvent(input: Omit<AgendaEvent, "id" | "source">): AgendaEvent {
  seedAgendaIfNeeded();
  const ev: AgendaEvent = { ...input, id: `a-${Date.now()}`, source: "internal" };
  agendaEvents.push(ev);
  return ev;
}

// ---- Feed de mensajes (in-memory) ----
let _feedSeeded = false;
let feed: FeedItem[] = [];

function seedFeedIfNeeded() {
  if (_feedSeeded) return;
  _feedSeeded = true;

  const kinds: FeedKind[] = ["fallback", "moderation", "error", "human_takeover", "normal"];
  const roles: Array<"user" | "bot"> = ["user", "bot"];

  const now = Date.now();
  feed = Array.from({ length: 60 }).map((_, i) => {
    const kind = kinds[i % kinds.length];
    return {
      id: `f-${i + 1}`,
      ts: new Date(now - i * 60_000 * 15).toISOString(), // cada 15 min
      type: kind,
      session_id: `s-${String((i % 20) + 1).padStart(4, "0")}`,
      role: roles[i % 2],
      text:
        kind === "fallback" ? `No encontré respuesta para la consulta #${i + 1}` :
        kind === "moderation" ? `Mensaje marcado por moderación #${i + 1}` :
        kind === "error" ? `Error del proveedor en turno #${i + 1}` :
        kind === "human_takeover" ? `Se sugiere tomar control #${i + 1}` :
        `Mensaje normal #${i + 1}`,
      severity: kind === "error" ? 3 : kind === "moderation" ? 2 : 1,
      resolved: i % 4 === 0 ? true : false,
    };
  });
}

export function getFeed(params: {
  q?: string;
  type?: FeedKind | "todas";
  resolved?: "true" | "false" | undefined;
  page?: number;
  limit?: number;
}): { items: FeedItem[]; total: number; summary: FeedListResponse["summary"] } {
  seedFeedIfNeeded();

  const q = (params.q ?? "").trim().toLowerCase();
  const type = params.type && params.type !== "todas" ? params.type : undefined;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(5, params.limit ?? 20));
  const resolvedFilter =
    params.resolved === "true" ? true : params.resolved === "false" ? false : undefined;

  let out = feed.slice();

  if (type) {
    out = out.filter((x) => x.type === type);
  }
  if (resolvedFilter !== undefined) {
    out = out.filter((x) => x.resolved === resolvedFilter);
  }
  if (q) {
    out = out.filter(
      (x) =>
        x.text.toLowerCase().includes(q) ||
        x.session_id.toLowerCase().includes(q)
    );
  }

  const total = out.length;

  // resumen por tipo y no-resueltos (para las píldoras)
  const summary = {
    total: feed.length,
    fallback: feed.filter((x) => x.type === "fallback").length,
    moderation: feed.filter((x) => x.type === "moderation").length,
    error: feed.filter((x) => x.type === "error").length,
    human_takeover: feed.filter((x) => x.type === "human_takeover").length,
    unresolved: feed.filter((x) => !x.resolved).length,
  };

  out.sort((a, b) => (a.ts > b.ts ? -1 : 1)); // más reciente primero

  const start = (page - 1) * limit;
  const items = out.slice(start, start + limit);

  return { items, total, summary };
}

export function resolveFeedItem(id: string, resolved: boolean): FeedItem | null {
  seedFeedIfNeeded();
  const idx = feed.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  feed[idx] = { ...feed[idx], resolved };
  return feed[idx];
}

export function resolveFeedBulk(filter: {
  q?: string;
  type?: FeedKind | "todas";
  resolved?: "true" | "false";
}): { updated: number } {
  seedFeedIfNeeded();
  const q = (filter.q ?? "").trim().toLowerCase();
  const type = filter.type && filter.type !== "todas" ? filter.type : undefined;
  const resolvedFilter =
    filter.resolved === "true" ? true : filter.resolved === "false" ? false : undefined;

  let out = feed.slice();
  if (type) out = out.filter((x) => x.type === type);
  if (resolvedFilter !== undefined) out = out.filter((x) => x.resolved === resolvedFilter);
  if (q) out = out.filter((x) => x.text.toLowerCase().includes(q) || x.session_id.toLowerCase().includes(q));

  let updated = 0;
  for (const it of out) {
    if (!it.resolved) {
      it.resolved = true;
      updated++;
    }
  }
  return { updated };
}
// ---- Conversaciones (in-memory) ----
const conversationMap = new Map<string, ConversationDetail>();

function seedConversationIfNeeded(id: string) {
  if (conversationMap.has(id)) return;

  // genera 10 mensajes alternando user/bot
  const now = Date.now();
  const messages = Array.from({ length: 10 }).map((_, i) => ({
    role: i % 2 === 0 ? "user" as const : "bot" as const,
    text:
      i % 2 === 0
        ? `Mensaje del usuario #${i / 2 + 1}`
        : `Respuesta del bot #${i / 2 + 1}`,
    ts: new Date(now - (10 - i) * 5 * 60_000).toISOString(),
  }));

  conversationMap.set(id, {
    session_id: id,
    messages,
  });
}

export function getOrInitConversation(session_id: string): ConversationDetail {
  seedConversationIfNeeded(session_id);
  // en este mock siempre existirá tras el seed
  return conversationMap.get(session_id)!;
}