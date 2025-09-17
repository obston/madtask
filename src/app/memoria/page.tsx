import api from "@/lib/api";
import MemoryTable from "@/components/memoria/MemoriaTable";
import Empty from "@/components/UI/Empty";

export type MemItem = {
  id: number;
  tipo: "user" | "assistant" | "system";
  contenido: string;
  estado: "pending" | "approved" | "archived" | "forgotten";
  created_at: string;
};

type SP = { state?: string; q?: string; cliente_id?: string; apiKey?: string };

export default async function MemoriaPage({ searchParams }: { searchParams?: Promise<SP> }) {
  const sp = (await searchParams) ?? {};
  const qs = new URLSearchParams();
  if (sp.state) qs.set("state", sp.state);
  if (sp.q) qs.set("q", sp.q);
  if (sp.cliente_id) qs.set("cliente_id", sp.cliente_id);
  else if (sp.apiKey) qs.set("apiKey", sp.apiKey);

  const data = await api<{ ok: true; items: any[] }>(`/api/memoria?${qs.toString()}`);
  const items: MemItem[] = (data.items ?? []).map((r) => ({
    id: r.id,
    tipo: r.metadata?.role ?? "system",
    contenido: r.content,
    estado: r.state,
    created_at: r.created_at,
  }));

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Memoria</h1>
      {items.length ? <MemoryTable initialItems={items} /> : <Empty description="Sin memoria para mostrar." />}
    </div>
  );
}
