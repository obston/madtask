"use client";
import { useEffect, useState } from "react";
import type { AdminSettings } from "@/lib/types";

export default function ConfigBotPage() {
  const [s, setS] = useState<AdminSettings | null>(null);
  const load = async ()=> setS(await (await fetch("/api/admin/settings",{cache:"no-store"})).json());
  useEffect(()=>{ load(); }, []);
  const save = async (patch: Partial<AdminSettings>) => { await fetch("/api/admin/settings",{method:"PATCH",body:JSON.stringify(patch)}); load(); };
  if (!s) return <main className="p-6">Cargando…</main>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Configuración del Bot</h1>

      <div className="flex gap-6">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" defaultChecked={s.bot.allow_files} onChange={e=>save({ bot: { ...s.bot, allow_files: e.target.checked } })}/>
          <span>Permitir archivos</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" defaultChecked={s.bot.allow_images} onChange={e=>save({ bot: { ...s.bot, allow_images: e.target.checked } })}/>
          <span>Permitir imágenes</span>
        </label>
      </div>

      <div className="grid gap-3">
        <textarea
          defaultValue={s.bot.system_prompt ?? ""}
          placeholder="System prompt…"
          className="min-h-[120px] rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2"
          onBlur={e=>save({ bot: { ...s.bot, system_prompt: e.target.value } })}
        />
        <textarea
          defaultValue={s.bot.policies ?? ""}
          placeholder="Políticas…"
          className="min-h-[100px] rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2"
          onBlur={e=>save({ bot: { ...s.bot, policies: e.target.value } })}
        />
      </div>
    </main>
  );
}
