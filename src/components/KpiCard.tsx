export default function KpiCard({
    title, value, helper,
  }: { title: string; value: string | number; helper?: string }) {
    return (
      <div className="rounded-2xl border border-neutral-800 p-4 bg-neutral-900 shadow-sm">
        <div className="text-xs text-neutral-400">{title}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {helper && <div className="mt-1 text-xs text-neutral-500">{helper}</div>}
      </div>
    );
  }

  