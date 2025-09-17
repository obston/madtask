'use client';

export type MemItem = {
    id: number;
    tipo: 'user' | 'assistant' | 'system';
    contenido: string;
    estado: 'pending' | 'approved' | 'archived' | 'forgotten';
    created_at: string; // ISO
  }

type Props = { initialItems: MemItem[] };

export default function MemoryTable({ initialItems }: Props) {
  if (!initialItems.length) {
    return <div className="rounded border px-4 py-6 text-sm opacity-60">No hay items para mostrar.</div>;
  }
  return (
    <div className="space-y-3">
      {initialItems.map((it) => (
        <div key={it.id} className="rounded border p-3">
          <div className="text-xs opacity-60">{it.created_at}</div>
          <div className="text-xs mt-1">
            <span className="mr-2">tipo: <b>{it.tipo}</b></span>
            <span>estado: <b>{it.estado}</b></span>
          </div>
          <div className="mt-2">{it.contenido}</div>
        </div>
      ))}
    </div>
  );
}
