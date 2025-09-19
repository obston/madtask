// src/lib/date.ts
export function shortWhen(d: Date) {
    const now = new Date();
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const diffDays = Math.floor((startOf(now).getTime() - startOf(d).getTime()) / 86400000);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  
    if (diffDays <= 0) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (diffDays === 1) return "ayer";
    if (diffDays === 2) return "antier";
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
  }
  