import Link from "next/link";
import type { AgendaItem } from "@/types";

const MOCK: AgendaItem[] = [
  // Ejemplos (déjalos comentados si prefieres vacía bonita)
  // { id: 1, titulo: "Llamada con cliente Demo", cuando: "Hoy 17:30", estado: "pendiente" },
  // { id: 2, titulo: "Configurar horario atención", cuando: "Mañana 10:00", estado: "en curso" },
];

export default function AgendaMini() {
      const items: AgendaItem[] = MOCK;

  return (
    <div className="rounded-2xl border border-neutral-800/70 bg-neutral-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">Agenda próxima</h3>
        <Link
          href="/agenda"
          className="text-xs text-neutral-300 hover:text-white underline underline-offset-4"
        >
          Abrir agenda
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-neutral-400">
          No hay eventos próximos. <span className="opacity-70">Programa recordatorios desde Admin.</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((ev) => (
            <li
              key={ev.id}
              className="rounded-xl bg-neutral-900/60 border border-neutral-800/70 p-3"
            >
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex items-center rounded px-1.5 py-0.5 border border-neutral-700">
                  {ev.estado}
                </span>
                <span className="ml-auto">{ev.cuando}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-200">{ev.titulo}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
