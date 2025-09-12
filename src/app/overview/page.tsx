import { getBaseUrl } from "@/lib/getBaseUrl";
import type { ApiOverview, OverviewFeedItem } from "@/lib/types";

async function getOverview(apiKey = "pub_amazing_101"): Promise<ApiOverview> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/overview?apiKey=${apiKey}`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar overview");
  return res.json() as Promise<ApiOverview>;
}

export default async function OverviewPage() {
  const overview = await getOverview("pub_amazing_101");
  if ("error" in overview) return <div className="p-6">No se pudo cargar overview</div>;

  const latest: OverviewFeedItem[] = Array.isArray(overview.feed) ? overview.feed.slice(0, 5) : [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Overview</h1>
      <div className="text-sm text-gray-500 mb-4">
        Pendientes embeddings: {overview.kpis.pendientes_embeddings}
      </div>

      <div className="space-y-2">
        {latest.map((m) => (
          <div key={m.id} className="rounded border p-3">
            <div className="text-xs opacity-60">{m.created_at}</div>
            <div className="font-medium">{m.role}</div>
            <div>{m.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


