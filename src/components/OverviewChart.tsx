// src/components/OverviewChart.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import MiniChart7d from "@/components/MiniChart7d";

type Point = { date: string; chats: number };
type ChartPayload = {
  ok: boolean;
  period: string; // "7d" | "15d" | "30d"
  conversations: Point[];
  fallbacks: Point[];
};

const PERIODS = ["7d", "15d", "30d"] as const;
type Period = (typeof PERIODS)[number];
type SeriesKey = "conversations" | "fallbacks";

export default function OverviewChart() {
  const [period, setPeriod] = useState<Period>("15d");
  const [series, setSeries] = useState<SeriesKey>("conversations");
  const [data, setData] = useState<ChartPayload | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(p: Period) {
    setLoading(true);
    try {
      const r = await fetch(`/api/overview/chart?period=${p}`, { cache: "no-store" });
      const j = (await r.json()) as ChartPayload;
      setData(j);
    } catch {
      setData({ ok: false, period: p, conversations: [], fallbacks: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const current = useMemo<Point[]>(() => {
    if (!data) return [];
    return (data[series] ?? []) as Point[];
  }, [data, series]);

  return (
    <div className="rounded-2xl border border-neutral-800/70 bg-neutral-900/40 p-3 md:p-4">
      {/* Header con tabs y selector de periodo */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-xl border border-neutral-800 overflow-hidden">
          <button
            onClick={() => setSeries("conversations")}
            className={`px-3 py-1.5 text-sm ${
              series === "conversations" ? "bg-neutral-800 text-white" : "text-neutral-300 hover:text-white"
            }`}
          >
            Conversaciones
          </button>
          <button
            onClick={() => setSeries("fallbacks")}
            className={`px-3 py-1.5 text-sm border-l border-neutral-800 ${
              series === "fallbacks" ? "bg-neutral-800 text-white" : "text-neutral-300 hover:text-white"
            }`}
          >
            Fallbacks
          </button>
        </div>

        <div className="inline-flex rounded-xl border border-neutral-800 overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm ${
                period === p ? "bg-neutral-800 text-white" : "text-neutral-300 hover:text-white"
              } ${p !== PERIODS[0] ? "border-l border-neutral-800" : ""}`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-56 md:h-64 animate-pulse rounded-xl bg-neutral-800/40" />
      ) : (
        <MiniChart7d data={current} />
      )}
    </div>
  );
}
