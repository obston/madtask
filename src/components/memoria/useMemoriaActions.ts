'use client';

import { useCallback, useState } from 'react';

type Accion = 'approve' | 'archive' | 'forget';

export function useMemoriaActions(clienteId?: number) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const call = useCallback(
    async (id: number, action: Accion) => {
      setLoadingId(id);
      try {
        const qs = new URLSearchParams();
        if (clienteId) qs.set('cliente_id', String(clienteId));

        const res = await fetch(`/api/memoria/${id}/${action}?${qs}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved_by: 'owner@dashboard' }), // opcional
          cache: 'no-store',
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'Error al actualizar memoria');
        }
      } finally {
        setLoadingId(null);
      }
    },
    [clienteId],
  );

  return {
    approve: (id: number) => call(id, 'approve'),
    archive: (id: number) => call(id, 'archive'),
    forget: (id: number) => call(id, 'forget'),
    loadingId,
  };
}
