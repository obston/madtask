// src/components/DateTag.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  value: string | number | Date;
  variant?: "time" | "date" | "datetime"; // por simplicidad
};

export default function DateTag({ value, variant = "datetime" }: Props) {
  const [now, setNow] = useState<number>(() => Date.now()); // re-render periódico (min)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const d = useMemo(() => new Date(value), [value, now]);
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }),
    []
  );
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat("es-MX", { year: "numeric", month: "short", day: "2-digit" }),
    []
  );

  let txt = "";
  if (variant === "time") txt = timeFmt.format(d);
  else if (variant === "date") txt = dateFmt.format(d);
  else txt = `${dateFmt.format(d)} • ${timeFmt.format(d)}`;

  return (
    <span suppressHydrationWarning>{txt}</span>
  );
}
