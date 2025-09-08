"use client";
import { useEffect, useState } from "react";
import type { AdminSettings } from "@/lib/types";

export default function VoicePage() {
  const [s, setS] = useState<AdminSettings | null>(null);
  const load = async ()=> setS(await (await fetch("/api/admin/settings",{cache:"no-store"})).json());
  useEffect(()=>{ load(); }, []);
  const save = async (patch: Partial<AdminSettings>) => { await fetch("/api/admin/settings",{method:"PATCH",body:JSON.stringify(patch)}); load(); };
  if (!s) return <main className="p-6">Cargando…</main>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Bots por llamada</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        <select defaultValue={s.voice.provider} className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2"
          onChange={e=>save({ voice: { ...s.voice, provider: e.target.value as any } })}>
          <option value="none">Sin proveedor</option>
          <option value="twilio">Twilio</option>
          <option value="vonage">Vonage</option>
          <option value="net2phone">Net2Phone</option>
        </select>
        <input placeholder="Número de transferencia" defaultValue={s.voice.transfer_number}
          className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2"
          onBlur={e=>save({ voice: { ...s.voice, transfer_number: e.target.value } })} />
        <select defaultValue={s.voice.stt} className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2"
          onChange={e=>save({ voice: { ...s.voice, stt: e.target.value as any } })}>
          <option value="whisper">Whisper</option>
          <option value="deepgram">Deepgram</option>
          <option value="none">None</option>
        </select>
        <select defaultValue={s.voice.tts} className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2"
          onChange={e=>save({ voice: { ...s.voice, tts: e.target.value as any } })}>
          <option value="azure">Azure</option>
          <option value="elevenlabs">ElevenLabs</option>
          <option value="none">None</option>
        </select>
      </div>
    </main>
  );
}
