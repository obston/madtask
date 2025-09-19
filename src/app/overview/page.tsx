// src/app/overview/page.tsx
import KpiCard from "@/components/KpiCard";
import OverviewChart from "@/components/OverviewChart";
import NotificacionesMini from "@/components/NotificacionesMini";
import AgendaMini from "@/components/AgendaMini";
import { getBaseUrl } from "@/lib/getBaseUrl";

export default async function OverviewPage() {
  // fetch datos reales (sin cache)
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/overview`, { cache: "no-store" });
  const { kpis = {} } = (res.ok ? await res.json() : { kpis: {} }) as {
    kpis: Record<string, number>;
  };
  // Serie real para la gráfica
  const chartRes = await fetch(`${base}/api/overview/chart?period=15d`, { cache: "no-store" });
  const chartJson = chartRes.ok ? await chartRes.json() : { conversations: [] };
  const chartData: { date: string; chats: number }[] = chartJson.conversations ?? [];


  return (
    <div className="space-y-6">
      {/* KPIs arriba */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Pendientes Embeddings"
          value={kpis.pendientes_embeddings ?? 0}
          helper="Fragmentos por vectorizar"
        />
        <KpiCard
          title="Conversaciones (24h)"
          value={kpis.conversaciones_24h ?? 0}
          helper="Sesiones únicas del último día"
        />
        {/* slots para futuros KPIs */}
        <KpiCard title="Fallbacks (%)" value={kpis.fallback_rate ?? 0} helper="Próximamente" />
        <KpiCard title="Takeovers (%)" value={kpis.takeover_rate ?? 0} helper="Próximamente" />
      </div>

      {/* Gráfica central con tabs/periodos */}
      <OverviewChart />

      {/* Dos recuadros abajo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NotificacionesMini />
        <AgendaMini />
      </div>
    </div>
  );
}
