// src/lib/api.ts
import { getBaseUrl } from '@/lib/getBaseUrl';

type JsonRes<T> = T & { ok?: boolean };

export default async function api<T = any>(path: string, init: RequestInit = {}): Promise<JsonRes<T>> {
  const BASE = await getBaseUrl(); // <- await
  const url  = path.startsWith('http') ? path : `${BASE}${path}`;
  const res  = await fetch(url, {
    ...init,
    // evita cache accidental si llamas desde server components
    cache: 'no-store',
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
  });

  if (!res.ok) {
    let text = '';
    try { text = await res.text(); } catch {}
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}
