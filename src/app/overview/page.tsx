import  appApi  from "@/lib/api";
type SP = { apiKey?: string; cliente_id?: string };

export const dynamic = "force-dynamic";

export default async function OverviewPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.cliente_id) qs.set("cliente_id", sp.cliente_id);
  else if (sp.apiKey) qs.set("apiKey", sp.apiKey);

  const overview = await appApi<{ ok: boolean; kpis?: { pendientes_embeddings: number; conversaciones_24h: number } }>(
    `/api/overview?${qs.toString()}`
  );

  const kpis = overview.kpis ?? { pendientes_embeddings: 0, conversaciones_24h: 0 };

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold mb-2">Overview</h1>
      <div className="text-sm text-gray-500">Pendientes embeddings: {kpis.pendientes_embeddings}</div>
      <div className="text-sm text-gray-500">Conversaciones (24h): {kpis.conversaciones_24h}</div>
    </div>
  );
}
