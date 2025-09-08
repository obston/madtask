"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Pt = { date: string; chats: number };
export default function MiniChart15d({ data }: { data: Pt[] }) {
  // Muestra solo labels espaciados (cada ~3 días)
  const tickFormatter = (v: string, idx: number) => (idx % 3 === 0 ? v.slice(5) : "");

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="date" tickFormatter={tickFormatter} tickMargin={8} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="chats" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
