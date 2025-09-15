// src/app/overview/page.tsx
export const dynamic = 'force-dynamic';

type Search = { apiKey?: string; cliente_id?: string };

export default async function OverviewPage({ searchParams }: { searchParams?: Search }) {
  const qs = new URLSearchParams();
  if (searchParams?.cliente_id) qs.set('cliente_id', searchParams.cliente_id);
  else if (searchParams?.apiKey) qs.set('apiKey', searchParams.apiKey);

  const res = await fetch(`/api/overview?${qs.toString()}`, { cache: 'no-store' }); // 👈 relativo
  const overview = await res.json();
  if (!overview.ok) throw new Error(overview.error || 'No se pudo cargar overview');

  const kpis = overview.kpis ?? {
    pendientes_embeddings: overview.pendientes_embeddings ?? 0,
    conversaciones_24h:   overview.conversaciones_24h   ?? 0,
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Overview</h1>
      <div className="text-sm text-gray-500">Pendientes embeddings: {kpis.pendientes_embeddings}</div>
    </div>
  );
}
