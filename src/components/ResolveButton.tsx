"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ResolveButton({
  id,
  resolved,
}: { id: string; resolved: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={resolved || pending}
      onClick={() =>
        start(async () => {
          await fetch(`/api/mensajes/${id}/resolve`, { method: "PATCH" });
          router.refresh();
        })
      }
      className="text-xs px-2 py-1 rounded border border-neutral-800 disabled:opacity-50"
    >
      {resolved ? "Resuelto" : pending ? "Marcando…" : "Marcar resuelto"}
    </button>
  );
}
