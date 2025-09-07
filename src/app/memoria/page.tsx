export default async function MemoriaPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Memoria</h1>
      <p className="opacity-80">
        Aquí gestionaremos la memoria/KB del bot (resúmenes, embeddings, olvidos selectivos, etc.).
        Por ahora es un placeholder: más adelante conectaremos al backend para CRUD.
      </p>
      <div className="rounded-xl border border-neutral-800 p-4">
        <div className="text-sm opacity-80">
          • Pendiente: listar “recuerdos” activos<br/>
          • Acciones: añadir, editar, archivar, olvidar<br/>
          • Reproceso de embeddings y cola de pendientes
        </div>
      </div>
    </div>
  );
}
