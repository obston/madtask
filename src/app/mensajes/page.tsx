import api from "@/lib/api";
import Empty from "@/components/UI/Empty";

type SP = { cliente_id?: string; apiKey?: string };
type Msg = { created_at: string; role: "user" | "assistant" | "system"; message: string };

export default async function MensajesPage({ searchParams }: { searchParams?: Promise<SP> }) {
  const sp = (await searchParams) ?? {};
  const qs = new URLSearchParams();
  if (sp.cliente_id) qs.set("cliente_id", String(sp.cliente_id));
  else if (sp.apiKey) qs.set("apiKey", sp.apiKey);

  const json = await api<{ ok: true; items: Msg[] }>(`/api/mensajes?${qs.toString()}`);
  const items = json.items ?? [];

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold mb-4">Mensajes</h1>
      {!items.length && <Empty description="Aún no hay mensajes para este cliente." />}
      {items.map((m, i) => (
        <div key={i} className="rounded border p-3">
          <div className="text-xs opacity-60">{m.created_at}</div>
          <div className="font-medium">{m.role}</div>
          <div>{m.message ?? ""}</div>
        </div>
      ))}
    </div>
  );
}
