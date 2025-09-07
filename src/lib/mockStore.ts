// src/lib/mockStore.ts
import { ConversationDetail } from "@/lib/types";
import { mockConversationDetail } from "@/lib/mockData";

const store = new Map<string, ConversationDetail>();

export function getOrInitConversation(id: string): ConversationDetail | null {
  if (store.has(id)) return store.get(id)!;
  const seeded = mockConversationDetail(id);
  if (!seeded) return null;
  store.set(id, JSON.parse(JSON.stringify(seeded))); // copia defensiva
  return store.get(id)!;
}

export function appendMessage(
  id: string,
  msg: ConversationDetail["messages"][number]
): ConversationDetail | null {
  const conv = getOrInitConversation(id);
  if (!conv) return null;
  conv.messages.push(msg);
  return conv;
}
