import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { resolveClienteId } from '@/lib/tenant';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const clienteId = await resolveClienteId(req.url);
  const body = await req.json().catch(() => ({}));
  const approvedBy = body?.approved_by ?? 'dashboard';

  const client = await pool.connect();
  try {
    const { rowCount } = await client.query(
      `
      UPDATE public.n8n_vectors
      SET state='approved', approved_at=NOW(), approved_by=$1
      WHERE id = $2::int AND cliente_id = $3::int
      `,
      [approvedBy, params.id, clienteId]
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
