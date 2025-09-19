// src/components/conversaciones/skeletons.tsx
export function SidebarSkeleton() {
  return (
    <ul className="animate-pulse space-y-2 px-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="py-3 border-b border-white/5">
          <div className="h-3 w-40 bg-white/10 rounded mb-2" />
          <div className="h-2 w-64 bg-white/10 rounded" />
        </li>
      ))}
    </ul>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`h-14 ${i % 2 ? "w-1/2 ml-auto" : "w-2/3"} bg-white/10 rounded-2xl`}
        />
      ))}
    </div>
  );
}
