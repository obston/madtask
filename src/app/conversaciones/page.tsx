import api from "@/lib/api";
import ConversationList from "@/components/ConversationList";

type SP = { page?: string; q?: string; apiKey?: string; cliente_id?: string };

export default async function ConversacionesPage({ searchParams }: { searchParams?: Promise<SP> }) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(parseInt(sp.page ?? "1", 10), 1);

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (sp.q) qs.set("q", sp.q);
  if (sp.cliente_id) qs.set("cliente_id", sp.cliente_id);
  else if (sp.apiKey) qs.set("apiKey", sp.apiKey);

  const listJson = await api<{ ok: true; items: any[] }>(`/api/conversaciones?${qs.toString()}`);
  const items = (listJson.items ?? []).map((r) => ({
    ...r,
    phone_or_user: r.phone_or_user ?? "",
    estado: r.estado ?? "",
  }));

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      <div className="col-span-12">
        <ConversationList items={items} />
      </div>
    </div>
  );
}
