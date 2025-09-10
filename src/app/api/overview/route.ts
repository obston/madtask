// src/app/api/overview/route.ts
import { NextResponse } from "next/server";
import { q, dbPing } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Ejemplo de consulta real mínima (ajústala a tu esquema si ya tenías otra)
  try {
    const ok = await dbPing();

    // Puedes cambiar estas consultas por las que ya usabas:
    const [{ now }] = await q<{ now: string }>("SELECT NOW()::text as now");
    // Ejemplo: contar conversaciones si tienes esa tabla/vista:
    // const [{ total_conversaciones }] =
    //   await q<{ total_conversaciones: number }>("SELECT COUNT(*)::int AS total_conversaciones FROM conversaciones");

    return NextResponse.json({
      status: ok ? "ok" : "fail",
      now,
      // total_conversaciones,
    });
  } catch (err: any) {
    console.error("[/api/overview] error:", err);
    return NextResponse.json(
      { error: err?.message ?? "overview_error" },
      { status: 500 }
    );
  }
}

