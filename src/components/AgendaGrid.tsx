"use client";

import React, { useEffect, useMemo, useState, Fragment } from "react";
import { addDays, addWeeks, eachHourOfInterval, endOfDay, endOfWeek, format, isSameDay, startOfDay, startOfWeek } from "date-fns";
import NewEventModal from "./NewEventModal";
import type { AgendaEvent } from "@/lib/types";



type Props = {
  initialEvents: AgendaEvent[];
  startISO: string; // rango inicial
  endISO: string;
};

export default function AgendaGrid({ initialEvents, startISO, endISO }: Props) {
  const [mode, setMode] = useState<"week" | "day">("week");
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(startISO),
    to: new Date(endISO),
  });
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents);
  const [showNew, setShowNew] = useState(false);
  const [newDefault, setNewDefault] = useState<Date | undefined>(undefined);

  // recarga al navegar
  async function reload(from: Date, to: Date) {
    const url = `/api/agenda?from=${from.toISOString()}&to=${to.toISOString()}`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    setEvents(json.items);
    setRange({ from, to });
  }

  function goPrev() {
    if (mode === "week") {
      const from = addWeeks(range.from, -1);
      const to = endOfWeek(from, { weekStartsOn: 1 });
      reload(from, to);
    } else {
      const from = startOfDay(addDays(range.from, -1));
      const to = endOfDay(from);
      reload(from, to);
    }
  }
  function goNext() {
    if (mode === "week") {
      const from = addWeeks(range.from, 1);
      const to = endOfWeek(from, { weekStartsOn: 1 });
      reload(from, to);
    } else {
      const from = startOfDay(addDays(range.from, 1));
      const to = endOfDay(from);
      reload(from, to);
    }
  }
  function goToday() {
    if (mode === "week") {
      const from = startOfWeek(new Date(), { weekStartsOn: 1 });
      const to = endOfWeek(from, { weekStartsOn: 1 });
      reload(from, to);
    } else {
      const from = startOfDay(new Date());
      const to = endOfDay(new Date());
      reload(from, to);
    }
  }

  async function onCreated() {
    // recargar el mismo rango
    await reload(range.from, range.to);
  }

  // grid helpers
  const days = useMemo(() => {
    if (mode === "week") {
      return Array.from({ length: 7 }).map((_, i) => addDays(range.from, i));
    }
    return [range.from];
  }, [mode, range]);

  const hours = useMemo(() => {
    const start = startOfDay(range.from);
    const end = endOfDay(range.from);
    return eachHourOfInterval({ start, end }).slice(8, 21); // 8:00..20:00
  }, [range]);

  const dayEvents = (d: Date) =>
    events.filter((ev) => isSameDay(new Date(ev.start_ts), d));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded border border-neutral-800" onClick={goPrev}>◀</button>
          <button className="px-3 py-2 rounded border border-neutral-800" onClick={goToday}>Hoy</button>
          <button className="px-3 py-2 rounded border border-neutral-800" onClick={goNext}>▶</button>
          <div className="ml-3 font-medium">
            {mode === "week"
              ? `${format(days[0], "dd MMM")} — ${format(days[days.length - 1], "dd MMM, yyyy")}`
              : format(range.from, "eeee dd 'de' MMM, yyyy")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={"px-3 py-2 rounded border " + (mode === "day" ? "border-white" : "border-neutral-800")}
            onClick={() => {
              setMode("day");
              const from = startOfDay(range.from);
              const to = endOfDay(range.from);
              reload(from, to);
            }}
          >
            Día
          </button>
          <button
            className={"px-3 py-2 rounded border " + (mode === "week" ? "border-white" : "border-neutral-800")}
            onClick={() => {
              setMode("week");
              const from = startOfWeek(range.from, { weekStartsOn: 1 });
              const to = endOfWeek(range.from, { weekStartsOn: 1 });
              reload(from, to);
            }}
          >
            Semana
          </button>

          {/* Placeholder de integraciones */}
          <button className="px-3 py-2 rounded border border-neutral-800">
            Conectar Google
          </button>

          <button
            className="px-3 py-2 rounded border border-neutral-700"
            onClick={() => {
              setNewDefault(range.from);
              setShowNew(true);
            }}
          >
            Nuevo
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(0, 1fr))` }}>
        {/* Encabezados */}
        <div />
        {days.map((d, i) => (
          <div key={i} className="py-2 px-2 text-sm font-medium border-b border-neutral-800">
            {format(d, "EEE dd/MM")}
          </div>
        ))}

        {/* Horas + columnas */}
        {hours.map((h, r) => (
  <Fragment key={`row-${r}`}>
    <div className="text-xs text-right pr-2 py-3 border-r border-neutral-900 opacity-60">
      {format(h, "HH:mm")}
    </div>
    {days.map((d, c) => (
      <div
        key={`cell-${r}-${c}`}  // <-- key única por celda
        className="border-b border-neutral-900 min-h-[48px] px-1"
      >
        {dayEvents(d)
          .filter((ev) => new Date(ev.start_ts).getHours() === h.getHours())
          .map((ev) => (
            <div
              key={ev.id} // <-- id único del evento
              className="mt-1 rounded border border-neutral-700 bg-neutral-900/60 px-2 py-1 text-xs"
              title={`${format(new Date(ev.start_ts), "HH:mm")} – ${format(new Date(ev.end_ts), "HH:mm")}`}
            >
              <div className="font-medium truncate">{ev.title}</div>
              <div className="opacity-70">
                {format(new Date(ev.start_ts), "HH:mm")} – {format(new Date(ev.end_ts), "HH:mm")}
              </div>
            </div>
          ))}
      </div>
    ))}
  </Fragment>
))}

      </div>

      <NewEventModal
        open={showNew}
        defaultStart={newDefault}
        onClose={() => setShowNew(false)}
        onCreated={onCreated}
      />
    </div>
  );
}
