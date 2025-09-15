import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { resolveClienteId } from '@/lib/tenant';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get('state') ?? 'pending'; // pending|approved|archived|forgotten
  const q = url.searchParams.get('q') ?? '';
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? '20'))
  );
  const offset = (page - 1) * pageSize;

  const client = await pool.connect();
  try {
    const clienteId = await resolveClienteId(req.url, client);

    const params: any[] = [clienteId, state, pageSize, offset];
    let where = `cliente_id = $1 AND state = $2`;
    if (q) {
      params.push(`%${q}%`);
      where += ` AND content ILIKE $5`;
    }

    const { rows } = await client.query(
      `
      SELECT id, content, metadata, state, created_at, approved_at, approved_by
      FROM public.n8n_vectors
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4;
      `,
      params
    );

    const { rows: countRows } = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM public.n8n_vectors
      WHERE ${where};
      `,
      params
    );

    return NextResponse.json({
      ok: true,
      data: rows,
      page,
      pageSize,
      total: countRows[0]?.total ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  } finally {
    client.release();
  }
}
