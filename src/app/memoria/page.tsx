import { pool } from '@/lib/db';
import MemoriaTable, { MemItem } from '@/components/memoria/MemoriaTable';

export const dynamic = 'force-dynamic'; // evita cache en dev

export default async function MemoriaPage({
  searchParams,
}: {
  searchParams?: { state?: string; q?: string; cliente_id?: string };
}) {
  const state = searchParams?.state ?? 'pending';
  const q = searchParams?.q ?? '';
  const clienteId =
    searchParams?.cliente_id
      ? Number(searchParams.cliente_id)
      : process.env.CLIENTE_ID_DEFAULT
      ? Number(process.env.CLIENTE_ID_DEFAULT)
      : undefined;

  if (!clienteId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Memoria</h1>
        <p className="text-amber-400">
          Falta definir <code>cliente_id</code> o <code>CLIENTE_ID_DEFAULT</code>.
        </p>
      </div>
    );
  }

  const client = await pool.connect();
  try {
    const params: any[] = [clienteId, state];
    let where = 'cliente_id = $1 AND state = $2';
    if (q) {
      params.push(`%${q}%`);
      where += ' AND content ILIKE $3';
    }

    const { rows } = await client.query<MemItem>(
      `
      SELECT id, content, metadata, state, created_at, approved_at, approved_by
      FROM public.n8n_vectors
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT 100;
      `,
      params,
    );

    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Memoria</h1>

        {/* (Opcional) controles de filtro/búsqueda */}
        {/* Puedes agregar tabs para state y un input para q */}

        <MemoriaTable initialItems={rows} clienteId={clienteId} />
      </div>
    );
  } finally {
    client.release();
  }
}
