// src/lib/getBaseUrl.ts
import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
  // Cliente: regresamos "" para fetch relativo
  if (typeof window !== 'undefined') return '';

  const h = await headers(); // <- aquí el await
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}
