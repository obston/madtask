// src/app/agenda/page.tsx
import api from "@/lib/api";
export const dynamic = "force-dynamic";

type SP = { fromISO?: string; toISO?: string; apiKey?: string; cliente_id?: string };

export default async function AgendaPage({ searchParams }: { searchParams: Promise<SP> | SP }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.fromISO) qs.set("from", sp.fromISO);
  if (sp.toISO) qs.set("to", sp.toISO);
  if (sp.cliente_id) qs.set("cliente_id", sp.cliente_id);
  if (sp.apiKey) qs.set("apiKey", sp.apiKey);

  const data = await api<{ items: any[] }>(`/api/agenda?${qs.toString()}`);
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Agenda</h1>
      {/* render de items o <Empty/> si no hay */}
    </div>
  );
}
