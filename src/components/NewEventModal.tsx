"use client";

import { useState } from "react";
import { addMinutes } from "date-fns";

type Props = {
  open: boolean;
  defaultStart?: Date;
  onClose: () => void;
  onCreated: () => void; // refrescar lista
};

export default function NewEventModal({ open, defaultStart, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    (defaultStart ?? new Date()).toISOString().slice(0, 10)
  );
  const [time, setTime] = useState(
    (defaultStart ?? new Date()).toTimeString().slice(0, 5)
  );
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function save() {
    setSaving(true);
    try {
      const [hh, mm] = time.split(":").map((x) => parseInt(x, 10));
      const start = new Date(date);
      start.setHours(hh, mm, 0, 0);
      const end = addMinutes(start, duration);

      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Nuevo evento",
          start_ts: start.toISOString(),
          end_ts: end.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          status: "confirmed",
        }),
      });
      if (!res.ok) throw new Error("create failed");
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
        <div className="text-lg font-medium">Nueva cita</div>
        <div className="grid gap-2">
          <label className="text-sm">
            Título
            <input
              className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Llamada de seguimiento"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              Fecha
              <input
                type="date"
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Hora
              <input
                type="time"
                className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>
          <label className="text-sm">
            Duración (min)
            <input
              type="number"
              min={15}
              step={15}
              className="mt-1 w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value || "30", 10))}
            />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button className="px-3 py-2 rounded border border-neutral-800" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="px-3 py-2 rounded border border-neutral-700"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Guardando…" : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
