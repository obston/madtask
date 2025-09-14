import { getBaseUrl } from "@/lib/getBaseUrl";

type Row = { id:number; role:string; message:string|null; created_at:string };

export default async function MensajesPage() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/mensajes?apiKey=pub_amazing_101&limit=50`, { cache: "no-store" });
  const json = await res.json() as { ok?: true; data?: Row[]; error?: string };
  if (!json.ok) return <div className="p-6">No se pudo cargar mensajes</div>;

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold mb-4">Mensajes</h1>
      {(json.data ?? []).map(m => (
        <div key={m.id} className="rounded border p-3">
          <div className="text-xs opacity-60">{m.created_at}</div>
          <div className="font-medium">{m.role}</div>
          <div>{m.message}</div>
        </div>
      ))}
    </div>
  );
}
