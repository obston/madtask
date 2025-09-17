export default function Empty({
    title = "Sin datos",
    description = "Conecta tus fuentes o vuelve más tarde.",
  }: { title?: string; description?: string }) {
    return (
      <div className="rounded-lg border p-6 text-center space-y-2">
        <div className="font-medium">{title}</div>
        <div className="text-sm opacity-60">{description}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4 animate-pulse space-y-3">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  