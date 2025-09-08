"use client";
import { useEffect, useState } from "react";
import type { AdminSettings } from "@/lib/types";

export default function SeguridadPage() {
  const [s, setS] = useState<AdminSettings | null>(null);
  const load = async ()=> setS(await (await fetch("/api/admin/settings",{cache:"no-store"})).json());
  useEffect(()=>{ load(); }, []);
  const save = async (patch: Partial<AdminSettings>) => { await fetch("/api/admin/settings",{method:"PATCH",body:JSON.stringify(patch)}); load(); };
  if (!s) return <main className="p-6">Cargando…</main>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Seguridad & Accesos</h1>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" defaultChecked={s.security.audit_log_enabled}
          onChange={e=>save({ security: { ...s.security, audit_log_enabled: e.target.checked } })} />
        <span>Habilitar audit logs</span>
      </label>

      <div className="rounded-2xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400">
            <tr><th className="text-left px-4 py-2">Rol</th><th className="text-left px-4 py-2">Permisos</th></tr>
          </thead>
          <tbody>
            {s.security.roles.map(r=>(
              <tr key={r.key} className="border-t border-neutral-800">
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2 text-neutral-400">{r.perms.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
