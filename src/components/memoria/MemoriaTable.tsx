'use client';

import { useMemo, useState } from 'react';
import { useMemoriaActions } from './useMemoriaActions';

export type MemItem = {
  id: number;
  content: string;
  metadata: any;
  state: 'pending' | 'approved' | 'archived' | 'forgotten';
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
};

export default function MemoriaTable({
  initialItems,
  clienteId,
}: {
  initialItems: MemItem[];
  clienteId?: number;
}) {
  const [items, setItems] = useState<MemItem[]>(initialItems);
  const { approve, archive, forget, loadingId } = useMemoriaActions(clienteId);

  async function onAction(id: number, action: 'approve' | 'archive' | 'forget') {
    // Optimistic update
    const prev = items;
    const nextState =
      action === 'approve' ? 'approved' : action === 'archive' ? 'archived' : 'forgotten';

    setItems((cur) => cur.map((it) => (it.id === id ? { ...it, state: nextState } : it)));

    try {
      if (action === 'approve') await approve(id);
      else if (action === 'archive') await archive(id);
      else await forget(id);
    } catch (e: any) {
      // rollback
      setItems(prev);
      alert(e?.message || 'Error al actualizar memoria');
    }
  }

  const rows = useMemo(() => items, [items]);

  return (
    <div className="rounded-2xl border border-neutral-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900">
          <tr>
            <th className="text-left px-4 py-3">Tipo</th>
            <th className="text-left px-4 py-3">Contenido</th>
            <th className="text-left px-4 py-3">Estado</th>
            <th className="text-left px-4 py-3">Fecha</th>
            <th className="text-left px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-neutral-800">
              <td className="px-4 py-3">
                <span className="px-2 py-1 rounded-full bg-neutral-800">
                  {r.metadata?.type ?? 'Fact'}
                </span>
              </td>
              <td className="px-4 py-3">{r.content}</td>
              <td className="px-4 py-3 capitalize">{r.state}</td>
              <td className="px-4 py-3">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-4 py-3 space-x-2">
                {r.state === 'pending' && (
                  <>
                    <button
                      disabled={loadingId === r.id}
                      onClick={() => onAction(r.id, 'approve')}
                      className="px-3 py-1 rounded-lg border border-emerald-600 hover:bg-emerald-600/20 disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      disabled={loadingId === r.id}
                      onClick={() => onAction(r.id, 'archive')}
                      className="px-3 py-1 rounded-lg border border-amber-600 hover:bg-amber-600/20 disabled:opacity-50"
                    >
                      Archivar
                    </button>
                    <button
                      disabled={loadingId === r.id}
                      onClick={() => onAction(r.id, 'forget')}
                      className="px-3 py-1 rounded-lg border border-rose-600 hover:bg-rose-600/20 disabled:opacity-50"
                    >
                      Olvidar
                    </button>
                  </>
                )}

                {r.state === 'approved' && (
                  <>
                    <button
                      disabled={loadingId === r.id}
                      onClick={() => onAction(r.id, 'archive')}
                      className="px-3 py-1 rounded-lg border border-amber-600 hover:bg-amber-600/20 disabled:opacity-50"
                    >
                      Archivar
                    </button>
                    <button
                      disabled={loadingId === r.id}
                      onClick={() => onAction(r.id, 'forget')}
                      className="px-3 py-1 rounded-lg border border-rose-600 hover:bg-rose-600/20 disabled:opacity-50"
                    >
                      Olvidar
                    </button>
                  </>
                )}

                {r.state === 'archived' && (
                  <button
                    disabled={loadingId === r.id}
                    onClick={() => onAction(r.id, 'approve')}
                    className="px-3 py-1 rounded-lg border border-emerald-600 hover:bg-emerald-600/20 disabled:opacity-50"
                  >
                    Re-aprobar
                  </button>
                )}

                {r.state === 'forgotten' && (
                  <span className="text-neutral-400 italic">Sin acciones</span>
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-neutral-400" colSpan={5}>
                No hay items para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
