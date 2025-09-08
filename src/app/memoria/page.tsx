import MemoryTable from "@/components/MemoryTable";

export default function MemoriaPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Memoria</h1>
        <p className="text-sm text-neutral-400">
          Aprueba, archiva u olvida recuerdos. El botón “Reprocesar embeddings” simula una cola.
        </p>
      </div>
      <MemoryTable />
    </main>
  );
}