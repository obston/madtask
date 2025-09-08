"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FeedKind } from "@/lib/types";

export default function BulkResolveButton({
  q,
  type,
  resolved,
  disabled,
}: {
  q: string;
  type: FeedKind | "todas";
  resolved?: "true" | "false";
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (type) qs.set("type", type);
  if (resolved) qs.set("resolved", resolved);

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() =>
        start(async () => {
          await fetch(`/api/mensajes/resolve-bulk?${qs.toString()}`, { method: "PATCH" });
          router.refresh();
        })
      }
      className="text-xs px-3 py-2 rounded border border-neutral-800 disabled:opacity-50"
      title="Marca como resueltos todos los mensajes del filtro actual"
    >
      {pending ? "Marcando…" : "Marcar todos como resueltos"}
    </button>
  );
}
