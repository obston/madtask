"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MiniChart7d({ data }: { data: { date: string; chats: number }[] }) {
  return (
    <div className="h-56 w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis width={28} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid #27272a" }} labelStyle={{ color: "#e5e7eb" }} />
          <Line type="monotone" dataKey="chats" stroke="#60a5fa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
