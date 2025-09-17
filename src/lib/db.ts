// src/lib/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // ajusta si usas otra var
  // ssl: { rejectUnauthorized: false }, // si tu pg necesita SSL
});

/** Tag template para queries con placeholders $1, $2, ... */
function buildQuery(strings: TemplateStringsArray, values: any[]) {
  // Une los trozos y mete $n entre cada valor
  let text = '';
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) text += `$${i + 1}`;
  }
  return { text, values };
}

export async function q<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const { text, values: params } = buildQuery(strings, values);
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

export async function qOne<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T | null> {
  const rows = await q<T>(strings, ...values);
  return rows[0] ?? null;
}
