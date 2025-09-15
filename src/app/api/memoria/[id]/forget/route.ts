import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { resolveClienteId } from '@/lib/tenant';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const clienteId = await resolveClienteId(req.url);

  const client = await pool.connect();
  try {
    const { rowCount } = await client.query(
      `
      UPDATE public.n8n_vectors
      SET state='forgotten'
      WHERE id = $1::int AND cliente_id = $2::int
      `,
      [params.id, clienteId]
    );
    if (!rowCount) {
      return NextResponse.json({ ok: false, error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}

