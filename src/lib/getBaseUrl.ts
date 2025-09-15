// src/lib/getBaseUrl.ts
import { getBaseUrl } from '@/lib/getBaseUrl';


/** Devuelve el base URL del servidor para fetch en Server Components/Route Handlers */
export async function getBaseUrl(): Promise<string> {
  // En el cliente (browser) usa rutas relativas
  if (typeof window !== 'undefined') return '';

  const h = await headers(); // 👈 aquí estaba el error: falta await
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

// (opcional) export default si prefieres importar por defecto
// export default getBaseUrl;
