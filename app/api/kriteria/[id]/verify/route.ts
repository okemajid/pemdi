import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let newStatus = "uploaded";
    if (body.action === "verify") newStatus = "verified";
    else if (body.action === "reject") newStatus = "rejected";
    else if (body.action === "cancel") newStatus = "uploaded"; // back to uploaded state
    else if (typeof body.verify !== 'undefined') { // backwards compatibility
        newStatus = body.verify ? "verified" : "uploaded";
    }

    // Update kriteria status
    await query(
      `UPDATE kriteria SET status = ? WHERE id = ?`,
      [newStatus, id]
    );

    // Get indikator_id of this kriteria
    const [kriteria] = await query(`SELECT indikator_id FROM kriteria WHERE id = ?`, [id]) as any[];
    if (kriteria && kriteria.indikator_id) {
      const indikatorId = kriteria.indikator_id;

      // Get indikator bobot
      const [indikatorRow] = await query(`SELECT bobot FROM indikator WHERE id = ?`, [indikatorId]) as any[];
      const indikatorBobot = indikatorRow?.bobot || 0;

      // Recalculate nilai_capaian
      const verifiedKriteria = await query(
        `SELECT SUM(bobot) as total_bobot, MAX(level) as max_level FROM kriteria WHERE indikator_id = ? AND status = 'verified'`,
        [indikatorId]
      ) as any[];

      const kriteriaBobot = verifiedKriteria[0]?.total_bobot || 0;
      const maxLevel = verifiedKriteria[0]?.max_level ?? null;

      let totalBobot = (indikatorBobot / 4) * kriteriaBobot;
      if (kriteriaBobot >= 3.98) {
        totalBobot = indikatorBobot;
      }

      // Predikat berdasarkan rasio nilai/bobot
      let predikat: string | null = null;
      const ratio = indikatorBobot > 0 ? totalBobot / indikatorBobot : 0;
      if (ratio >= 1.0) predikat = "Leading / Pemimpin";
      else if (ratio >= 0.75) predikat = "Embedded / Dapat Baik";
      else if (ratio >= 0.5) predikat = "Berkembang Baik";
      else if (ratio >= 0.25) predikat = "Emerging / Cukup";
      else if (ratio > 0) predikat = "Inisiasi / Rintisan";

      await query(
        `UPDATE indikator SET nilai_capaian = ?, predikat = ? WHERE id = ?`,
        [Number(totalBobot), predikat, indikatorId]
      );

    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Error verifying kriteria:", error);
    return NextResponse.json({ error: "Failed to verify kriteria" }, { status: 500 });
  }
}
