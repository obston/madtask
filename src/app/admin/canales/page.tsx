"use client";
import { useEffect, useState } from "react";
import type { AdminSettings } from "@/lib/types";

export default function CanalesPage() {
  const [s, setS] = useState<AdminSettings | null>(null);
  const load = async () => {
    const r = await fetch("/api/admin/settings", { cache: "no-store" });
    setS(await r.json());
  };
  useEffect(()=>{ load(); }, []);

  if (!s) return <main className="p-6">Cargando…</main>;
  const save = async (patch: Partial<AdminSettings>) => {
    await fetch("/api/admin/settings", { method:"PATCH", body: JSON.stringify(patch) });
    load();
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Canales</h1>

      <section className="space-y-3">
        <h2 className="font-medium">WhatsApp</h2>
        <div className="grid gap-2">
          {s.channels.whatsapp_numbers.map(n=>(
            <div key={n.id} className="flex items-center justify-between border border-neutral-800 rounded-xl p-3">
              <div><div className="font-mono">{n.label}</div><div className="text-xs text-neutral-400">{n.state}</div></div>
              <button className="border border-neutral-700 px-3 py-1 rounded-lg">Configurar</button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Facebook App</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2" defaultValue={s.channels.fb_app?.app_id} placeholder="App ID"
            onBlur={e=>save({ channels: { fb_app: { ...s.channels.fb_app, app_id: e.target.value } } as any })} />
          <input className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2" defaultValue={s.channels.fb_app?.webhook_url} placeholder="Webhook URL"
            onBlur={e=>save({ channels: { fb_app: { ...s.channels.fb_app, webhook_url: e.target.value } } as any })} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Webchat</h2>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" defaultChecked={s.channels.webchat?.enabled}
            onChange={e=>save({ channels: { webchat: { enabled: e.target.checked } } as any })} />
          <span>Habilitar webchat</span>
        </label>
      </section>
    </main>
  );
}
