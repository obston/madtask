import KpiCard from "@/components/KpiCard";
import MiniChart7d from "@/components/MiniChart7d";
import { overviewMock } from "@/lib/mockData";

export default function OverviewPage() {
  const data = overviewMock;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Conversaciones hoy" value={data.conversaciones_hoy} />
        <KpiCard title="Fallback rate" value={(data.fallback_rate * 100).toFixed(1) + "%"} />
        <KpiCard title="Avg response time" value={`${data.avg_response_time} s`} />
        <KpiCard title="pendientes embedding" value={data.pendientes_embedding} />
      </div>
      <MiniChart7d data={data.series_7d} />
    </div>
  );
}
