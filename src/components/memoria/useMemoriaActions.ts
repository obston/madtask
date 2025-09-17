// src/components/memoria/useMemoriaActions.ts
"use client";
import api from "@/lib/api";
import { useState, useCallback } from "react";

type Action = "approve" | "archive" | "forget";

export function useMemoriaActions() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (id: string, action: Action) => {
    setLoadingId(id);
    setError(null);
    try {
      const res = await api<{ ok: boolean; error?: string }>(`/api/memoria/${id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error(res.error || "No se pudo completar la acción");
      return true;
    } catch (e: any) {
      setError(e.message || "Error");
      return false;
    } finally {
      setLoadingId(null);
    }
  }, []);

  return {
    loadingId,
    error,
    approve: (id: string) => run(id, "approve"),
    archive: (id: string) => run(id, "archive"),
    forget: (id: string) => run(id, "forget"),
  };
}
